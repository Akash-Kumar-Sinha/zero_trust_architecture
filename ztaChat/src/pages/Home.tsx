import Header from "@/components/Shared/Header";
import { motion } from "framer-motion";
import { MessageCircle, Shield, Users, Lock, ArrowRight } from "lucide-react";

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  } as const;

  const features = [
    {
      icon: Lock,
      title: "End-to-End Encrypted",
      description: "Your messages are secured with military-grade encryption",
    },
    {
      icon: Shield,
      title: "Zero Trust Security",
      description:
        "Built with security-first architecture for maximum protection",
    },
    {
      icon: Users,
      title: "Private Conversations",
      description: "Connect securely with friends and colleagues",
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <motion.div
        className="sticky top-0 z-10 border-b border-[var(--sidebar-border)] bg-gradient-to-r from-card/98 via-card/95 to-card/98 backdrop-blur-xl shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Header url={"/home"} navTitle="Chats" title={"No Chat Selected"} />
      </motion.div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-transparent via-muted/5 to-muted/10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mb-8"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="relative">
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-12 h-12 text-[var(--primary-foreground)]" />
            </motion.div>

            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <Lock className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="text-center mb-8 max-w-md"
          variants={itemVariants}
        >
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Start a secure chat with your friends
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Select a conversation from the sidebar to begin chatting securely
            with end-to-end encryption.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-8"
          variants={itemVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-2 border-[var(--sidebar-border)] rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300"
              variants={itemVariants}
              whileHover={{
                scale: 1.02,
                y: -5,
                transition: { duration: 0.2 },
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--sidebar-accent)] to-[var(--sidebar-primary)] flex items-center justify-center mx-auto mb-4 shadow-lg"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <feature.icon className="w-8 h-8 text-[var(--sidebar-accent-foreground)]" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="text-center" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-[var(--primary-foreground)] font-medium shadow-lg shadow-[var(--primary)]/20"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span>Choose a friend to start chatting</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">
            Zero Trust Architecture • End-to-End Encrypted
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
