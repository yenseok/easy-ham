import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeft } from 'lucide-react';
import { CAMPUS_OPTIONS, JOB_OPTIONS, TECH_STACK_OPTIONS } from '@/constants/options';

export function SignUpPage() {
  const navigate = useNavigate();
  const [campus, setCampus] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>([]);
  const [customTech, setCustomTech] = useState('');

  const handleToggleJob = (job: string) => {
    if (selectedJobs.includes(job)) {
      setSelectedJobs(selectedJobs.filter((j) => j !== job));
    } else {
      setSelectedJobs([...selectedJobs, job]);
    }
  };

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
      setCustomTech('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 백엔드에 추가 정보 전송
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#FFF5EE] to-[#FFE8D6] p-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/login')}
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
            <div className="w-12 h-12 rounded-xl bg-[var(--brand-orange)] flex items-center justify-center">
              <span className="text-2xl">🐹</span>
            </div>
            <span className="text-3xl" style={{ fontWeight: 700 }}>편리햄!</span>
          </div>
          <h1 className="text-3xl" style={{ fontWeight: 700 }}>
            추가 정보 입력
          </h1>
          <p className="text-gray-600" style={{ fontWeight: 400 }}>
            서비스 이용을 위해 몇 가지 정보를 입력해주세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 캠퍼스 및 반 정보 */}
          <div className="space-y-2">
            <Label>
              캠퍼스 및 반 정보 <span className="text-[var(--brand-orange)]">*</span>
            </Label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Select value={campus} onValueChange={setCampus} required>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="캠퍼스 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPUS_OPTIONS.map((campusOption) => (
                      <SelectItem key={campusOption} value={campusOption}>
                        {campusOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  placeholder="반"
                  value={classNumber}
                  onChange={(e) => setClassNumber(e.target.value)}
                  className="h-12"
                  min="1"
                  max="99"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">소속 캠퍼스와 반을 선택/입력해주세요</p>
          </div>

          {/* 희망 직무 */}
          <div className="space-y-3">
            <Label>
              희망 직무 <span className="text-[var(--brand-orange)]">*</span>
            </Label>

            {/* 선택된 직무 */}
            {selectedJobs.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                {selectedJobs.map((job) => (
                  <Badge
                    key={job}
                    variant="secondary"
                    className="px-3 py-1.5 bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange-dark)]"
                  >
                    {job}
                    <button
                      type="button"
                      onClick={() => handleToggleJob(job)}
                      className="ml-2 hover:text-red-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* 직무 선택 그리드 */}
            <div className="p-4 border rounded-lg space-y-3">
              <p className="text-sm text-gray-600" style={{ fontWeight: 500 }}>
                자주 선택하는 직무
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {JOB_OPTIONS.map((job) => (
                  <button
                    key={job}
                    type="button"
                    onClick={() => handleToggleJob(job)}
                    disabled={selectedJobs.includes(job)}
                    className={`px-4 py-3 text-sm rounded-lg border transition-colors ${
                      selectedJobs.includes(job)
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white hover:bg-[var(--brand-orange-light)] hover:border-[var(--brand-orange)] border-gray-300'
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    {job}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 기술 스택 */}
          <div className="space-y-3">
            <Label>
              기술 스택 <span className="text-gray-500 text-sm" style={{ fontWeight: 400 }}>(선택)</span>
            </Label>

            {/* 선택된 기술 스택 */}
            {selectedTechStack.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                {selectedTechStack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="px-3 py-1.5 bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange-dark)]"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="ml-2 hover:text-red-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* 기술 스택 선택 그리드 */}
            <div className="p-4 border rounded-lg space-y-3">
              <p className="text-sm text-gray-600" style={{ fontWeight: 500 }}>
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
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white hover:bg-[var(--brand-orange-light)] hover:border-[var(--brand-orange)] border-gray-300'
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={!campus || !classNumber || selectedJobs.length === 0}
              className="w-full bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white py-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ fontWeight: 600 }}
            >
              <span className="text-lg">완료</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
