import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Camera,
  GraduationCap,
  Briefcase,
  Code,
  Bell,
  Save,
  X,
} from "lucide-react";
import { PageLayout } from "@/components/layouts/PageLayout";
import {
  CAMPUS_OPTIONS,
  JOB_OPTIONS,
  TECH_STACK_OPTIONS,
} from "@/constants/options";

export function MyPage() {
  const navigate = useNavigate();

  // 프로필 정보 상태
  const [nickname, setNickname] = useState("김싸피");
  const [profileImage, setProfileImage] = useState("");
  const [campus, setCampus] = useState("서울");
  const [classNumber, setClassNumber] = useState("1");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([
    "백엔드 개발자",
    "풀스택 개발자",
  ]);

  // 구독 키워드 상태
  const [subscribedKeywords, setSubscribedKeywords] = useState<string[]>([
    "프로젝트",
    "취업",
    "특강",
  ]);
  const [customKeyword, setCustomKeyword] = useState("");

  // 기술 스택 상태
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>([
    "Java",
    "Spring",
    "MySQL",
    "React",
  ]);
  const [customTech, setCustomTech] = useState("");

  const availableKeywords = [
    "프로젝트",
    "취업",
    "특강",
    "공지",
    "행사",
    "MT",
    "스터디",
    "멘토링",
    "채용",
    "코딩테스트",
    "알고리즘",
    "면접",
    "포트폴리오",
    "제출",
    "발표",
  ];

  // 희망 직무 토글
  const handleToggleJob = (job: string) => {
    if (selectedJobs.includes(job)) {
      setSelectedJobs(selectedJobs.filter((j) => j !== job));
    } else {
      setSelectedJobs([...selectedJobs, job]);
    }
  };

  // 기술 스택 추가
  const handleAddTech = (tech: string) => {
    if (!selectedTechStack.includes(tech)) {
      setSelectedTechStack([...selectedTechStack, tech]);
    }
  };

  const handleRemoveTech = (tech: string) => {
    setSelectedTechStack(selectedTechStack.filter((t) => t !== tech));
  };

  const handleAddCustomTech = () => {
    if (customTech.trim() && !selectedTechStack.includes(customTech.trim())) {
      setSelectedTechStack([...selectedTechStack, customTech.trim()]);
      setCustomTech("");
    }
  };

  // 구독 키워드 추가
  const handleAddKeyword = (keyword: string) => {
    if (
      subscribedKeywords.length < 5 &&
      !subscribedKeywords.includes(keyword)
    ) {
      setSubscribedKeywords([...subscribedKeywords, keyword]);
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setSubscribedKeywords(subscribedKeywords.filter((k) => k !== keyword));
  };

  const handleAddCustomKeyword = () => {
    if (
      customKeyword.trim() &&
      subscribedKeywords.length < 5 &&
      !subscribedKeywords.includes(customKeyword.trim())
    ) {
      setSubscribedKeywords([...subscribedKeywords, customKeyword.trim()]);
      setCustomKeyword("");
    }
  };

  // 저장 핸들러
  const handleSave = () => {
    // TODO: 백엔드에 저장
    alert("프로필이 저장되었습니다!");
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-3xl mb-2" style={{ fontWeight: 700 }}>
            마이페이지
          </h1>
          <p className="text-gray-600">
            회원 정보를 수정하고 알림 설정을 관리하세요
          </p>
        </div>

        <div className="space-y-6">
          {/* 프로필 정보 */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-[var(--brand-orange)]" />
              <h2 className="text-xl" style={{ fontWeight: 700 }}>
                프로필 정보
              </h2>
            </div>

            <div className="space-y-6">
              {/* 프로필 사진 */}
              <div>
                <Label className="mb-2 block">프로필 사진</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-[var(--brand-orange)] flex items-center justify-center relative group cursor-pointer">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      사진 업로드
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG 형식 (최대 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* 닉네임 */}
              <div>
                <Label htmlFor="nickname" className="mb-2 block">
                  닉네임
                </Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  className="max-w-md"
                />
              </div>
            </div>
          </Card>

          {/* 캠퍼스 및 반 정보 */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="w-5 h-5 text-[var(--brand-orange)]" />
              <h2 className="text-xl" style={{ fontWeight: 700 }}>
                캠퍼스 및 반 정보
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <Label htmlFor="campus" className="mb-2 block">
                  캠퍼스
                </Label>
                <Select value={campus} onValueChange={setCampus}>
                  <SelectTrigger id="campus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="class" className="mb-2 block">
                  반
                </Label>
                <Input
                  id="class"
                  type="number"
                  value={classNumber}
                  onChange={(e) => setClassNumber(e.target.value)}
                  placeholder="반 번호"
                  min="1"
                  max="99"
                />
              </div>
            </div>
          </Card>

          {/* 희망 직무 */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="w-5 h-5 text-[var(--brand-orange)]" />
              <h2 className="text-xl" style={{ fontWeight: 700 }}>
                희망 직무
              </h2>
            </div>

            <div className="space-y-4">
              {/* 선택된 직무 */}
              {selectedJobs.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                  {selectedJobs.map((job) => (
                    <Badge
                      key={job}
                      className="bg-[var(--brand-orange)] text-white px-3 py-1.5 flex items-center gap-2"
                    >
                      {job}
                      <button
                        onClick={() => handleToggleJob(job)}
                        className="hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* 직무 선택 그리드 */}
              <div className="p-4 border rounded-lg space-y-3">
                <p
                  className="text-sm text-gray-600"
                  style={{ fontWeight: 500 }}
                >
                  자주 선택하는 직무
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {JOB_OPTIONS.map((job) => (
                    <button
                      key={job}
                      type="button"
                      onClick={() => handleToggleJob(job)}
                      disabled={selectedJobs.includes(job)}
                      className={`px-4 py-3 text-sm rounded-lg border transition-colors ${
                        selectedJobs.includes(job)
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-white hover:bg-[var(--brand-orange-light)] hover:border-[var(--brand-orange)] border-gray-300"
                      }`}
                      style={{ fontWeight: 500 }}
                    >
                      {job}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 구독 키워드 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[var(--brand-orange)]" />
                <h2 className="text-xl" style={{ fontWeight: 700 }}>
                  구독 키워드
                </h2>
              </div>
              <span className="text-sm text-gray-500">
                {subscribedKeywords.length} / 5
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                관심 있는 키워드를 선택하면 관련 공지사항을 우선적으로
                알려드립니다.
              </p>

              {/* 선택된 키워드 */}
              {subscribedKeywords.length > 0 && (
                <div>
                  <Label className="mb-2 block text-xs">선택된 키워드</Label>
                  <div className="flex flex-wrap gap-2">
                    {subscribedKeywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        className="bg-[var(--brand-orange)] text-white px-3 py-1.5 flex items-center gap-2"
                      >
                        {keyword}
                        <button
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* 사용 가능한 키워드 */}
              <div>
                <Label className="mb-2 block text-xs">사용 가능한 키워드</Label>
                <div className="flex flex-wrap gap-2">
                  {availableKeywords
                    .filter((k) => !subscribedKeywords.includes(k))
                    .map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className={`px-3 py-1.5 cursor-pointer transition-colors ${
                          subscribedKeywords.length >= 5
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-[var(--brand-orange-light)] hover:border-[var(--brand-orange)]"
                        }`}
                        onClick={() => handleAddKeyword(keyword)}
                      >
                        {keyword}
                      </Badge>
                    ))}
                </div>
              </div>

              <Separator />

              {/* 직접 입력 */}
              <div>
                <Label className="mb-2 block text-xs">직접 입력</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="키워드를 입력하세요"
                    value={customKeyword}
                    onChange={(e) => setCustomKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomKeyword();
                      }
                    }}
                    disabled={subscribedKeywords.length >= 5}
                  />
                  <Button
                    onClick={handleAddCustomKeyword}
                    variant="outline"
                    disabled={subscribedKeywords.length >= 5}
                    className="border-[var(--brand-orange)] text-[var(--brand-orange)] hover:bg-[var(--brand-orange-light)]"
                  >
                    추가
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* 기술 스택 */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Code className="w-5 h-5 text-[var(--brand-orange)]" />
              <h2 className="text-xl" style={{ fontWeight: 700 }}>
                기술 스택
              </h2>
            </div>

            <div className="space-y-4">
              {/* 선택된 기술 스택 */}
              {selectedTechStack.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                  {selectedTechStack.map((tech) => (
                    <Badge
                      key={tech}
                      className="bg-[var(--brand-orange)] text-white px-3 py-1.5 flex items-center gap-2"
                    >
                      {tech}
                      <button
                        onClick={() => handleRemoveTech(tech)}
                        className="hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* 기술 스택 선택 그리드 */}
              <div className="p-4 border rounded-lg space-y-3">
                <p
                  className="text-sm text-gray-600"
                  style={{ fontWeight: 500 }}
                >
                  자주 사용하는 기술
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                  {TECH_STACK_OPTIONS.map((tech) => (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => handleAddTech(tech)}
                      disabled={selectedTechStack.includes(tech)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        selectedTechStack.includes(tech)
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-white hover:bg-[var(--brand-orange-light)] hover:border-[var(--brand-orange)] border-gray-300"
                      }`}
                      style={{ fontWeight: 500 }}
                    >
                      {tech}
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
              className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              저장하기
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
