import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Code, Save, X, LogOut } from "lucide-react";
import { PageLayout } from "@/components/layouts/PageLayout";
import { getUserProfile, updateUserProfile, deleteUser } from "@/services/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { getPositions, getSkills } from "@/services/api/codes";
import type { UserProfileResponse } from "@/services/api/auth";
import type { Position, Skill } from "@/services/api/codes";

const styles = `
  #classroom::-webkit-outer-spin-button,
  #classroom::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  #classroom {
    -moz-appearance: textfield;
  }
`;

export function MyPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  // 프로필 정보
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 수정 가능한 상태
  const [classroom, setClassroom] = useState("");
  const [selectedPositionIds, setSelectedPositionIds] = useState<number[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);

  // 초기 상태 저장 (변경사항 감지용)
  const [initialClassroom, setInitialClassroom] = useState("");
  const [initialPositionIds, setInitialPositionIds] = useState<number[]>([]);
  const [initialSkillIds, setInitialSkillIds] = useState<number[]>([]);

  // 코드 데이터
  const [positions, setPositions] = useState<Position[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // 포지션, 기술, 프로필 목록 조회
        const [positionsRes, skillsRes, profileRes] = await Promise.all([
          getPositions(),
          getSkills(),
          getUserProfile(),
        ]);

        // 포지션 설정
        let positionsData: Position[] = [];
        if (positionsRes.data?.positions) {
          positionsData = positionsRes.data.positions;
          setPositions(positionsData);
        }

        // 기술 설정
        let skillsData: Skill[] = [];
        if (skillsRes.data?.skills) {
          skillsData = skillsRes.data.skills;
          setSkills(skillsData);
        }

        // 사용자 프로필 설정
        if (profileRes.data) {
          setUserProfile(profileRes.data);
          const classroomValue = profileRes.data.classroom.toString();
          setClassroom(classroomValue);
          setInitialClassroom(classroomValue);

          // 포지션 ID 매핑
          if (profileRes.data.userPositions && positionsData.length > 0) {
            const positionIds = profileRes.data.userPositions
              .map(
                (posName) => positionsData.find((p) => p.name === posName)?.id
              )
              .filter((id): id is number => id !== undefined);
            setSelectedPositionIds(positionIds);
            setInitialPositionIds(positionIds);
          }

          // 기술 ID 매핑
          if (profileRes.data.userSkills && skillsData.length > 0) {
            const skillIds = profileRes.data.userSkills
              .map(
                (skillName) => skillsData.find((s) => s.name === skillName)?.id
              )
              .filter((id): id is number => id !== undefined);
            setSelectedSkillIds(skillIds);
            setInitialSkillIds(skillIds);
          }
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 포지션 토글
  const handleTogglePosition = (positionId: number) => {
    if (selectedPositionIds.includes(positionId)) {
      setSelectedPositionIds(
        selectedPositionIds.filter((id) => id !== positionId)
      );
    } else {
      setSelectedPositionIds([...selectedPositionIds, positionId]);
    }
  };

  // 기술 추가/제거
  const handleAddSkill = (skillId: number) => {
    if (!selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
  };

  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skillId));
  };

  // 변경사항 감지
  const hasChanges =
    classroom !== initialClassroom ||
    selectedPositionIds.length !== initialPositionIds.length ||
    selectedPositionIds.some((id) => !initialPositionIds.includes(id)) ||
    selectedSkillIds.length !== initialSkillIds.length ||
    selectedSkillIds.some((id) => !initialSkillIds.includes(id));

  // 저장
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const updateData = {
        classroom: parseInt(classroom),
        positionIds: selectedPositionIds,
        skillIds: selectedSkillIds,
      };

      const response = await updateUserProfile(updateData);
      console.log("[MyPage] 저장 응답:", response);

      // 저장 성공 후 초기값 업데이트
      setInitialClassroom(classroom);
      setInitialPositionIds(selectedPositionIds);
      setInitialSkillIds(selectedSkillIds);

      alert("프로필이 저장되었습니다!");
      // 대시보드로 이동
      navigate("/dashboard");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("프로필 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 회원탈퇴
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "정말 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteUser();
      console.log("[MyPage] 회원탈퇴 성공");

      // 로그아웃 처리
      logout();

      alert("회원탈퇴가 완료되었습니다.");
      // 로그인 페이지로 이동
      navigate("/login");
    } catch (error) {
      console.error("회원탈퇴 실패:", error);
      alert("회원탈퇴에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto p-8 text-center">
          <p>로딩 중...</p>
        </div>
      </PageLayout>
    );
  }

  if (!userProfile) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto p-8 text-center">
          <p>사용자 정보를 불러올 수 없습니다.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <style>{styles}</style>
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl" style={{ fontWeight: 700 }}>
            안녕하세요,{" "}
            <span className="text-[var(--brand-orange)]">
              {userProfile.name}
            </span>
            님
          </h1>
        </div>

        <div className="space-y-6">
          {/* 회원정보 */}
          <Card className="p-6">
            <h2 className="text-xl mb-2" style={{ fontWeight: 700 }}>
              회원정보
            </h2>

            {/* 이메일 - 읽기 전용 */}
            <div className="flex items-center gap-4 mb-1">
              <span className="text-sm text-gray-600 w-16">이메일</span>
              <p className="text-sm">{userProfile.email}</p>
            </div>

            {/* 소속 정보 한 줄 */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-16 mr-2">소속</span>
              <div className="flex items-center gap-1 flex-1">
                {/* 캠퍼스 */}
                <span className="text-sm text-gray-700">
                  {userProfile.campus}
                </span>

                {/* 기수 */}
                <span className="text-sm text-gray-700 mr-1">
                  {userProfile.generation}기
                </span>

                {/* 반 - 수정 가능 */}
                <div className="flex items-center gap-1.5">
                  <Input
                    id="classroom"
                    type="number"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    min="1"
                    max="99"
                    className="w-12 h-8 text-center"
                  />
                  <label htmlFor="classroom" className="text-sm text-gray-700">
                    반
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* 기술 스택 */}
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-[var(--brand-orange)]" />
              <h2 className="text-xl" style={{ fontWeight: 700 }}>
                기술 스택
              </h2>
            </div>

            <div className="space-y-4">
              {/* 선택된 기술 스택 */}
              {selectedSkillIds.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                  {selectedSkillIds.map((skillId) => {
                    const skill = skills.find((s) => s.id === skillId);
                    return skill ? (
                      <Badge
                        key={skillId}
                        className="bg-[var(--brand-orange)] text-white px-3 py-1.5 flex items-center gap-2"
                      >
                        {skill.name}
                        <button
                          onClick={() => handleRemoveSkill(skillId)}
                          className="hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

              {/* 기술 스택 선택 그리드 */}
              <div className="p-4 border rounded-lg space-y-3">
                <p
                  className="text-sm text-gray-600"
                  style={{ fontWeight: 500 }}
                >
                  기술 선택
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                  {skills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleAddSkill(skill.id)}
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
          </Card>

          {/* 희망 직무 */}
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[var(--brand-orange)]" />
              <h2 className="text-xl" style={{ fontWeight: 700 }}>
                희망 직무
              </h2>
            </div>

            <div className="space-y-4">
              {/* 선택된 직무 */}
              {selectedPositionIds.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                  {selectedPositionIds.map((posId) => {
                    const position = positions.find((p) => p.id === posId);
                    return position ? (
                      <Badge
                        key={posId}
                        className="bg-[var(--brand-orange)] text-white px-3 py-1.5 flex items-center gap-2"
                      >
                        {position.name}
                        <button
                          onClick={() => handleTogglePosition(posId)}
                          className="hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

              {/* 직무 선택 그리드 */}
              <div className="p-4 border rounded-lg space-y-3">
                <p
                  className="text-sm text-gray-600"
                  style={{ fontWeight: 500 }}
                >
                  직무 선택
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
          </Card>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "저장 중..." : "저장하기"}
            </Button>
          </div>

          {/* 회원탈퇴 버튼 */}
          <div className="flex justify-end border-t pt-6 mt-6">
            <Button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isDeleting ? "처리 중..." : "회원탈퇴"}
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
