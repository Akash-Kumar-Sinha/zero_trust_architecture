import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import * as z from "zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useNavigate } from "react-router";
import { load } from "@tauri-apps/plugin-store";
import axios from "axios";
import { AUTH_SERVER_URL } from "@/utils/constant";

type LOGIN_STAGE = "EMAIL" | "OTP" | "PASSWORD";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const Auth = () => {
  const navigate = useNavigate();

  const [loginStage, setLoginStage] = useState<LOGIN_STAGE>("EMAIL");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    password?: string;
  }>({});

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (errors.email) {
      setErrors({ ...errors, email: undefined });
    }
  };
  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (errors.otp) {
      setErrors({ ...errors, otp: undefined });
    }
  };
  const handlePasswodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    if (errors.password) {
      setErrors({ ...errors, password: undefined });
    }
  };

  const handleEmailSubmit = async () => {
    try {
      setLoading(true);
      const validatedData = emailSchema.parse({ email });
      setErrors({ ...errors, email: undefined });
      console.log("Valid email:", validatedData.email);
      const { data } = await axios.post(`${AUTH_SERVER_URL}/otp_sent`, {
        email,
      });
      if (data.success) {
        setLoginStage("OTP");
      }
      console.log(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, email: error.issues[0].message });
      }
    } finally {
      setLoading(false);
    }
  };
  const handleOtpVerification = async () => {
    try {
      setLoading(false);
      console.log("handleverification");
      const validatedData = otpSchema.parse({ otp });
      console.log("Valid OTP:", validatedData.otp);
      const otpValue = Number(validatedData.otp);
      const { data } = await axios.post(`${AUTH_SERVER_URL}/verify_otp`, {
        email,
        otp: otpValue,
      });

      const store = await load("store.json", { autoSave: true });
      console.log("OTP Verification returned token:", data);
      await store.set("otp_token", data.token);
      if (data.success) {
        setLoginStage("PASSWORD");
      }

      setErrors((prev) => ({ ...prev, otp: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, otp: error.issues[0].message }));
      } else {
        console.error("Unhandled error:", error);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleLogin = async () => {
    setLoading(true);
    setErrors({
      ...errors,
      password: undefined,
    });

    try {
      const validatedData = passwordSchema.parse({ password });
      console.log("Valid password:", validatedData.password);

      const store = await load("store.json", { autoSave: true });

      const val = await store.get("otp_token");
      const { data } = await axios.post(
        `${AUTH_SERVER_URL}/login_account`,
        {
          email,
          password: validatedData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${val}`,
          },
        }
      );
      if (data.success) {
        await store.delete("otp_token");

        await store.set("zta_auth_token", data.token);
        await store.set("u_email", email);
        await store.set("zta_private_key", data.private_key);

        navigate("/home");
      } else {
        setErrors((e) => ({
          ...e,
          general: "Login failed. Please try again.",
        }));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((e) => ({ ...e, password: error.issues[0].message }));
      } else {
        setErrors((e) => ({
          ...e,
          general: "Login failed. Please try again.",
        }));
      }
    } finally {
      // Clear loading state in all cases
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6 ">
          <Card>
            <CardHeader className="w-full flex justify-center">
              <CardTitle>Login to your account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 items-center">
                  {loginStage === "EMAIL" && (
                    <>
                      <Input
                        type="email"
                        placeholder="Enter Email"
                        className="border-2 border-primary"
                        onChange={handleEmailChange}
                        value={email}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email}</p>
                      )}
                    </>
                  )}
                  {loginStage === "OTP" && (
                    <>
                      <InputOTP
                        maxLength={6}
                        onChange={handleOtpChange}
                        value={otp}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={0}
                            className="border-2 border-primary"
                          />
                          <InputOTPSlot
                            index={1}
                            className="border-2 border-primary"
                          />
                          <InputOTPSlot
                            index={2}
                            className="border-2 border-primary"
                          />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={3}
                            className="border-2 border-primary"
                          />
                          <InputOTPSlot
                            index={4}
                            className="border-2 border-primary"
                          />
                          <InputOTPSlot
                            index={5}
                            className="border-2 border-primary"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                      {errors.otp && (
                        <p className="text-red-500 text-sm">{errors.otp}</p>
                      )}
                    </>
                  )}
                  {loginStage === "PASSWORD" && (
                    <>
                      <Input
                        type="password"
                        placeholder="Enter Password"
                        className="border-2 border-primary"
                        onChange={handlePasswodChange}
                        value={password}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm">
                          {errors.password}
                        </p>
                      )}
                    </>
                  )}

                  <Button
                    className="w-full"
                    onClick={
                      loginStage === "EMAIL"
                        ? handleEmailSubmit
                        : loginStage === "OTP"
                        ? handleOtpVerification
                        : handleLogin
                    }
                    disabled={loading}
                  >
                    {loginStage === "EMAIL"
                      ? "Send Otp"
                      : loginStage == "OTP"
                      ? "Verify Otp"
                      : "Login"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
