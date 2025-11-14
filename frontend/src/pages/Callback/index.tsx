/**
 * SSO 콜백 페이지
 * SSAFY OAuth 인증 후 리다이렉트되는 페이지
 * 역할: code 파라미터 추출 → 백엔드 호출 → 토큰 저장 → 라우팅
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/services/api/client";
import { API_ENDPOINTS } from "@/constants/api";
import { toast } from "sonner";
import type { User } from "@/types/user";

interface SsoCallbackResponse {
  token: {
    access_token: string;
    refresh_token: string;
  };
  name: string;
  email: string;
  userId: number | null;
  entRegn: string;
}

export function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const { login, setSsoData } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. URL에서 code 파라미터 추출
        const code = searchParams.get("code");

        if (!code) {
          toast.error("인증 코드가 없습니다");
          navigate("/login");
          return;
        }

        // 2. 백엔드 호출: code를 token으로 교환
        // SSO 콜백은 인증 토큰이 필요 없으므로 getPublic 사용
        const response = await apiClient.getPublic<SsoCallbackResponse>(
          `${API_ENDPOINTS.auth.ssoCallback}?code=${code}`
        );

        if (!response || response.status === undefined) {
          throw new Error("유효하지 않은 응답");
        }

        const { data } = response;

        // console.log("SSO 콜백 응답 데이터:", data);

        // 3. 응답 데이터 검증
        if (!data?.token?.access_token || !data?.token?.refresh_token) {
          throw new Error("토큰 정보가 없습니다");
        }

        // 4. Zustand store에 토큰 저장
        const user: User = {
          id: data.userId?.toString() || "",
          name: data.name,
          email: data.email,
        };

        login(user, data.token.access_token, data.token.refresh_token);

        // 5. 라우팅 분기: 신규 회원(userId === null) vs 기존 회원
        if (data.userId === null) {
          // 신규 회원: SSO 응답 데이터 저장 후 회원가입 페이지로
          setSsoData({
            token: data.token,
            name: data.name,
            email: data.email,
            entRegn: data.entRegn,
          });
          toast.success("추가 정보를 입력해주세요");
          navigate("/signup");
        } else {
          // 기존 회원: 대시보드로
          toast.success("로그인 성공했습니다");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("SSO 콜백 처리 실패:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "로그인 중 오류가 발생했습니다"
        );
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#FFF5EE] to-[#FFE8D6]">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center animate-spin">
              <img
                src="/images/logo/logo.png"
                alt="logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700">
              로그인 중입니다
            </p>
            <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 (로딩 완료 후)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#FFF5EE] to-[#FFE8D6]">
      <div className="text-center space-y-4">
        <p className="text-lg font-semibold text-gray-700">
          문제가 발생했습니다
        </p>
        <p className="text-sm text-gray-500">로그인 페이지로 돌아갑니다...</p>
      </div>
    </div>
  );
}
