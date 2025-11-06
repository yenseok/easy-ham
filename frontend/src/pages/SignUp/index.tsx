import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, ArrowLeft } from "lucide-react";
import {
  getCampuses,
  getSkills,
  getPositions,
  type Campus,
  type Position,
  type Skill,
} from "@/services/api/codes";
import { signup, type SignupRequest } from "@/services/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

export function SignUpPage() {
  const navigate = useNavigate();
  const { ssoData, clearSsoData } = useAuthStore();
  const [campusMap, setCampusMap] = useState<Record<string, number>>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);

  // 폼 데이터
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [generation, setGeneration] = useState("");
  const [campusId, setCampusId] = useState("");
  const [classroom, setClassroom] = useState("");
  const [selectedPositionIds, setSelectedPositionIds] = useState<number[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);

  // 코드 데이터 로드
  useEffect(() => {
    const loadCodes = async () => {
      try {
        const [campusRes, skillRes, positionRes] = await Promise.all([
          getCampuses(),
          getSkills(),
          getPositions(),
        ]);

        if (campusRes.status === 200 && campusRes.data.campuses) {
          // console.log("캠퍼스 데이터:", campusRes.data.campuses);
          // campuses 배열을 campusMap으로 변환
          const map = campusRes.data.campuses.reduce(
            (acc: Record<string, number>, campus: Campus) => {
              acc[campus.name] = campus.id;
              return acc;
            },
            {}
          );
          setCampusMap(map);

          // SSO 데이터에서 entRegn이 있으면 자동으로 캠퍼스 설정
          if (ssoData?.entRegn) {
            const campusName = ssoData.entRegn + "캠퍼스";
            if (map[campusName]) {
              const campusIdValue = String(map[campusName]);
              setCampusId(campusIdValue);
            }
          }
        }
        if (skillRes.status === 200) {
          // console.log("기술 스택 데이터:", skillRes.data.skills);
          setSkills(skillRes.data.skills);
        }
        if (positionRes.status === 200) {
          // console.log("포지션 데이터:", positionRes.data.positions);
          setPositions(positionRes.data.positions);
        }
      } catch (error) {
        console.error("코드 조회 실패:", error);
        toast.error("코드 데이터를 불러오는데 실패했습니다");
      } finally {
        setIsLoadingCodes(false);
      }
    };

    loadCodes();
  }, [ssoData]);

  // SSO 데이터로 name/email 초기화
  useEffect(() => {
    if (ssoData) {
      setName(ssoData.name);
      setEmail(ssoData.email);
    }
  }, [ssoData]);

  const handleTogglePosition = (positionId: number) => {
    if (selectedPositionIds.includes(positionId)) {
      setSelectedPositionIds(
        selectedPositionIds.filter((id) => id !== positionId)
      );
    } else {
      setSelectedPositionIds([...selectedPositionIds, positionId]);
    }
  };

  const handleToggleSkill = (skillId: number) => {
    if (selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skillId));
    } else {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
  };

  const handleRemovePosition = (positionId: number) => {
    setSelectedPositionIds(
      selectedPositionIds.filter((id) => id !== positionId)
    );
  };

  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skillId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name ||
      !email ||
      !generation ||
      !campusId ||
      !classroom ||
      selectedPositionIds.length === 0
    ) {
      toast.error("필수 항목을 모두 입력해주세요");
      return;
    }

    setIsLoading(true);
    try {
      const signupData: SignupRequest = {
        name,
        email,
        generation: parseInt(generation, 10),
        campusId: parseInt(campusId, 10),
        classroom: parseInt(classroom, 10),
        positionIds: selectedPositionIds,
        skillIds: selectedSkillIds,
      };

      const response = await signup(signupData);
      console.log("회원가입 응답:", response);

      if (response.status === 200) {
        toast.success("회원가입 성공했습니다!");
        clearSsoData(); // SSO 데이터 제거
        // 회원가입 성공 후 대시보드로 이동 (이미 로그인된 상태)
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        toast.error("회원가입에 실패했습니다");
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      toast.error("회원가입 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCodes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#FFF5EE] to-[#FFE8D6] p-8">
        <div className="text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#FFF5EE] to-[#FFE8D6] p-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-2"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-4 h-4" />
            이전
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
              <img
                src="/images/logo/logo.png"
                alt="logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-3xl" style={{ fontWeight: 700 }}>
              편리햄!
            </span>
          </div>
          <h1 className="text-3xl" style={{ fontWeight: 700 }}>
            회원가입
          </h1>
          <p className="text-gray-600" style={{ fontWeight: 400 }}>
            서비스 이용을 위해 몇 가지 정보를 입력해주세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이름 */}
          <div>
            <Label htmlFor="name">
              이름 <span className="text-[var(--brand-orange)]">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="h-12"
              disabled={!!ssoData}
              required
            />
          </div>

          {/* 이메일 */}
          <div>
            <Label htmlFor="email">
              이메일 <span className="text-[var(--brand-orange)]">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@ssafy.com"
              className="h-12"
              disabled={!!ssoData}
              required
            />
          </div>

          {/* 캠퍼스 */}
          <div>
            <Label htmlFor="campus">
              캠퍼스 <span className="text-[var(--brand-orange)]">*</span>
            </Label>
            {ssoData ? (
              // SSO 데이터 있음: 읽기 전용 표시
              <div className="h-12 flex items-center px-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {ssoData.entRegn} 캠퍼스
              </div>
            ) : (
              // SSO 데이터 없음: Select 드롭다운
              <Select value={campusId} onValueChange={setCampusId} required>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="캠퍼스 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(campusMap).map(([name, id]) => (
                    <SelectItem key={id} value={String(id)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 기수 및 반 */}
          <div className="space-y-2">
            <Label>
              기수 및 반 <span className="text-[var(--brand-orange)]">*</span>
            </Label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="기수 (예: 13)"
                  value={generation}
                  onChange={(e) => setGeneration(e.target.value)}
                  className="h-12"
                  min="1"
                  required
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  placeholder="반"
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  className="h-12"
                  min="1"
                  max="99"
                  required
                />
              </div>
            </div>
          </div>

          {/* 포지션 */}
          <div className="space-y-3">
            <Label>
              선호 포지션 <span className="text-[var(--brand-orange)]">*</span>
            </Label>

            {/* 선택된 포지션 */}
            {selectedPositionIds.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                {selectedPositionIds.map((posId) => {
                  const position = positions.find((p) => p.id === posId);
                  return (
                    <Badge
                      key={posId}
                      variant="secondary"
                      className="px-3 py-1.5 bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange-dark)]"
                    >
                      {position?.name}
                      <button
                        type="button"
                        onClick={() => handleRemovePosition(posId)}
                        className="ml-2 hover:text-red-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* 포지션 선택 그리드 */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {positions.map((position) => (
                  <button
                    key={position.id}
                    type="button"
                    onClick={() => handleTogglePosition(position.id)}
                    disabled={selectedPositionIds.includes(position.id)}
                    className={`px-4 py-3 text-sm rounded-lg border transition-colors ${
                      selectedPositionIds.includes(position.id)
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white hover:bg-[var(--brand-orange-light)] hover:border-[var(--brand-orange)] border-gray-300"
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    {position.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 기술 스택 */}
          <div className="space-y-3">
            <Label>
              보유 기술 스택{" "}
              <span
                className="text-gray-500 text-sm"
                style={{ fontWeight: 400 }}
              >
                (선택)
              </span>
            </Label>

            {/* 선택된 기술 스택 */}
            {selectedSkillIds.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                {selectedSkillIds.map((skillId) => {
                  const skill = skills.find((s) => s.id === skillId);
                  return (
                    <Badge
                      key={skillId}
                      variant="secondary"
                      className="px-3 py-1.5 bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange-dark)]"
                    >
                      {skill?.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skillId)}
                        className="ml-2 hover:text-red-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* 기술 스택 선택 그리드 */}
            <div className="p-4 border rounded-lg space-y-3">
              <p className="text-sm text-gray-600" style={{ fontWeight: 500 }}>
                자주 사용하는 기술 ({selectedSkillIds.length}/{skills.length})
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                {skills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleToggleSkill(skill.id)}
                    disabled={selectedSkillIds.includes(skill.id)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      selectedSkillIds.includes(skill.id)
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white hover:bg-[var(--brand-orange-light)] hover:border-[var(--brand-orange)] border-gray-300"
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={
                isLoading ||
                !name ||
                !email ||
                !generation ||
                !campusId ||
                !classroom ||
                selectedPositionIds.length === 0
              }
              className="w-full bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white py-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ fontWeight: 600 }}
            >
              <span className="text-lg">
                {isLoading ? "가입 중..." : "회원가입 완료"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
