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
import axios from "axios";
import { AUTH_SERVER_URL } from "@/utils/constant";
import { useAppDispatch, useAppSelector } from "@/utils/Hooks/redux";
import { saveOtpToken, saveAuthCredentials } from "@/features/storeSlice";
import { FlipWords } from "@/components/ui/flip-words";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, KeyRound } from "lucide-react";

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
  const dispatch = useAppDispatch();
  const { tokens } = useAppSelector((state) => state.store);

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
      setLoading(true);
      console.log("handleverification");
      const validatedData = otpSchema.parse({ otp });
      console.log("Valid OTP:", validatedData.otp);
      const otpValue = Number(validatedData.otp);
      const { data } = await axios.post(`${AUTH_SERVER_URL}/verify_otp`, {
        email,
        otp: otpValue,
      });

      console.log("OTP Verification returned token:", data);

      // Save OTP token using Redux
      await dispatch(saveOtpToken(data.token)).unwrap();

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

      // Get OTP token from Redux store
      const otpToken = tokens.otpToken;

      if (!otpToken) {
        setErrors((e) => ({
          ...e,
          general: "OTP token not found. Please verify OTP again.",
        }));
        return;
      }

      const { data } = await axios.post(
        `${AUTH_SERVER_URL}/login_account`,
        {
          email,
          password: validatedData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${otpToken}`,
          },
        }
      );

      if (data.success) {
        // Save auth credentials using Redux
        await dispatch(
          saveAuthCredentials({
            authToken: data.token,
            privateKey: data.private_key,
            userEmail: email,
          })
        ).unwrap();

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

  const words = ["SECURE", "TRUSTED", "PROTECTED", "VERIFIED"];

  const getStageIcon = () => {
    switch (loginStage) {
      case "EMAIL":
        return <Mail className="w-5 h-5" />;
      case "OTP":
        return <KeyRound className="w-5 h-5" />;
      case "PASSWORD":
        return <Lock className="w-5 h-5" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  const getStageTitle = () => {
    switch (loginStage) {
      case "EMAIL":
        return "Enter your email";
      case "OTP":
        return "Verify your identity";
      case "PASSWORD":
        return "Secure access";
      default:
        return "Login to your account";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  const stageVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
    exit: {
      opacity: 0,
      x: 20,
      scale: 0.95,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-6 md:p-10 relative overflow-hidden bg-gradient-to-br from-background to-background/80">
      <motion.div
        className="flex w-full max-w-md flex-col gap-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div className="text-center space-y-4" variants={itemVariants}>
          <motion.div
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Welcome to ZTA chat
          </motion.div>

          <motion.div
            className="text-xl font-medium text-muted-foreground"
            variants={itemVariants}
          >
            <span>Your </span>
            <FlipWords words={words} className="text-primary font-semibold" />
            <span> communication platform</span>
          </motion.div>
        </motion.div>

        {/* Auth Card */}
        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-xl bg-card/80 border-border/20 shadow-2xl">
            <CardHeader className="space-y-4 text-center">
              <motion.div
                className="flex items-center justify-center gap-2 text-primary"
                key={loginStage}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {getStageIcon()}
              </motion.div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {getStageTitle()}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={loginStage}
                  variants={stageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  {loginStage === "EMAIL" && (
                    <div className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          className="pl-10 bg-input/50 border-2 border-ring/30 focus:border-ring focus:ring-ring/10 transition-all duration-300"
                          onChange={handleEmailChange}
                          value={email}
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          className="text-destructive text-sm mt-2"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </div>
                  )}

                  {loginStage === "OTP" && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground text-center">
                        Enter the 6-digit code sent to your email
                      </p>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          onChange={handleOtpChange}
                          value={otp}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot
                              index={0}
                              className="bg-input/50 border-2 border-ring/30 focus:border-ring"
                            />
                            <InputOTPSlot
                              index={1}
                              className="bg-input/50 border-2 border-ring/30 focus:border-ring"
                            />
                            <InputOTPSlot
                              index={2}
                              className="bg-input/50 border-2 border-ring/30 focus:border-ring"
                            />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot
                              index={3}
                              className="bg-input/50 border-2 border-ring/30 focus:border-ring"
                            />
                            <InputOTPSlot
                              index={4}
                              className="bg-input/50 border-2 border-ring/30 focus:border-ring"
                            />
                            <InputOTPSlot
                              index={5}
                              className="bg-input/50 border-2 border-ring/30 focus:border-ring"
                            />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {errors.otp && (
                        <motion.p
                          className="text-destructive text-sm text-center mt-2"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {errors.otp}
                        </motion.p>
                      )}
                    </div>
                  )}

                  {loginStage === "PASSWORD" && (
                    <div className="space-y-4">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10 bg-input/50 border-2 border-ring/30 focus:border-ring focus:ring-ring/10 transition-all duration-300"
                          onChange={handlePasswodChange}
                          value={password}
                        />
                      </div>
                      {errors.password && (
                        <motion.p
                          className="text-destructive text-sm mt-2"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60"
                      onClick={
                        loginStage === "EMAIL"
                          ? handleEmailSubmit
                          : loginStage === "OTP"
                          ? handleOtpVerification
                          : handleLogin
                      }
                      disabled={loading}
                    >
                      {loading ? (
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </motion.div>
                      ) : (
                        <>
                          {loginStage === "EMAIL" && "Send Verification Code"}
                          {loginStage === "OTP" && "Verify Code"}
                          {loginStage === "PASSWORD" && "Secure Login"}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
