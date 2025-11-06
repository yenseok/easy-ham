import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { getSsoLoginUrl } from "@/services/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSSAFYLogin = async () => {
    setIsLoading(true);
    try {
      // 1. SSO 로그인 URL 받기
      const response = await getSsoLoginUrl();

      if (response.status !== 200) {
        toast.error("SSO URL 조회 실패");
        setIsLoading(false);
        return;
      }

      const ssoBaseUrl = response.data;

      // 2. 쿼리 파라미터 추가
      const params = new URLSearchParams({
        client_id:
          import.meta.env.VITE_SSO_CLIENT_ID ||
          (() => {
            throw new Error(
              "VITE_SSO_CLIENT_ID is not defined in environment variables"
            );
          })(),
        redirect_uri:
          import.meta.env.VITE_SSO_REDIRECT_URI ||
          (() => {
            throw new Error(
              "VITE_SSO_REDIRECT_URI is not defined in environment variables"
            );
          })(),
        response_type: "code",
      });

      const loginUrl = `${ssoBaseUrl}?${params.toString()}`;

      // 3. SSAFY SSO 페이지로 리다이렉트
      window.location.href = loginUrl;
    } catch (error) {
      console.error("SSO 로그인 실패:", error);
      toast.error("로그인 중 오류가 발생했습니다");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--brand-orange)] via-[#FF6B2C] via-30% to-[#FF9955] to-90% p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-radial from-white/20 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-gradient-radial from-yellow-300/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-orange-400/10 to-transparent rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
              <img src="/images/logo/logo.png" alt="logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-3xl" style={{ fontWeight: 700 }}>
              편리햄!
            </span>
          </div>

          <div className="space-y-6 max-w-md">
            <h1
              className="text-5xl"
              style={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              공지사항 관리,
              <br />
              이제 쉽게 시작하세요
            </h1>
            <p className="text-xl text-white/90" style={{ fontWeight: 400 }}>
              AI가 자동으로 분류하고 정리하는
              <br />
              스마트 워크스페이스 관리 서비스
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm">✓</span>
            </div>
            <div>
              <h3 style={{ fontWeight: 600 }}>AI 기반 자동 분류</h3>
              <p className="text-sm text-white/80">중요도별 공지사항 정리</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm">✓</span>
            </div>
            <div>
              <h3 style={{ fontWeight: 600 }}>실시간 알림</h3>
              <p className="text-sm text-white/80">
                중요한 공지를 놓치지 마세요
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm">✓</span>
            </div>
            <div>
              <h3 style={{ fontWeight: 600 }}>통합 검색</h3>
              <p className="text-sm text-white/80">빠르고 정확한 공지 검색</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span style={{ fontWeight: 500 }}>돌아가기</span>
          </button>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img src="/images/logo/logo.png" alt="logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl" style={{ fontWeight: 700 }}>
              편리햄!
            </span>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-3xl" style={{ fontWeight: 700 }}>
              로그인
            </h2>
            <p className="text-gray-600" style={{ fontWeight: 400 }}>
              SSAFY SSO로 간편하게 시작하세요
            </p>
          </div>

          {/* SSAFY SSO Login */}
          <div className="space-y-8">
            <Button
              onClick={handleSSAFYLogin}
              disabled={isLoading}
              className="w-full bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white py-7 disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={{ fontWeight: 600 }}
            >
              <span className="text-lg">
                {isLoading ? "SSAFY SSO로 이동 중..." : "SSAFY SSO로 로그인"}
              </span>
            </Button>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-500">
                SSAFY 교육생만 이용 가능합니다
              </p>
              <div className="pt-4 px-6 py-4 bg-gray-50 rounded-lg space-y-2">
                <p
                  className="text-xs text-gray-600 flex items-center gap-1.5"
                  style={{ fontWeight: 500 }}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  최초 로그인 시
                </p>
                <p className="text-xs text-gray-500">
                  반, 희망직무, 기술스택 등 추가 정보를 입력하시게 됩니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
