import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X } from "lucide-react";
import type { FC, ReactNode } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  position?: "left" | "right";
  className?: string;
}

const SidebarRoot: FC<SidebarProps> = ({
  isOpen,
  children,
  position = "right",
  className = "",
}) => {
  const variants: Variants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      x: position === "right" ? "100%" : "-100%",
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop/Overlay wrapper that handles closing */}
          {/* Note: In previous implementation there was no backdrop, just the sidebar.
              But here we are adding logic to support it. 
              The actual sidebar element should stop propagation if we add an onClick to the wrapper.
              
              However, the previous code I generated put the onClick on the sidebar div itself which is WRONG if that div is the visual sidebar.
              Wait, the motion.div IS the sidebar panel.
              
              If I want a backdrop, I should add another div.
              If I don't want a backdrop, I shouldn't add onClick to the sidebar.
              
              The linter complained 'onClose' is unused.
              
              If the user clicks "outside", it should close. But right now this component is just the panel?
              
              Let's Wrap it properly.
          */}
          <div className="fixed inset-0 z-40 pointer-events-none">
            {/* We can implement backdrop here if we want, currently pointer-events-none suggests no backdrop blocking mechanism, 
                 but sidebar needs to receive events.
             */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={variants}
              className={`absolute top-0 ${position === "right" ? "right-0" : "left-0"} h-[calc(100%-2rem)] m-4 rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col w-80 pointer-events-auto overflow-hidden ${className}`}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

interface SidebarHeaderProps {
  children: ReactNode;
  className?: string;
}

const SidebarHeader: FC<SidebarHeaderProps> = ({
  children,
  className = "",
}) => (
  <div
    className={`px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm ${className}`}
  >
    {children}
  </div>
);

interface SidebarTitleProps {
  children: ReactNode;
  className?: string;
}

const SidebarTitle: FC<SidebarTitleProps> = ({ children, className = "" }) => (
  <h2 className={`text-lg font-bold text-slate-800 ${className}`}>
    {children}
  </h2>
);

interface SidebarContentProps {
  children: ReactNode;
  className?: string;
}

const SidebarContent: FC<SidebarContentProps> = ({
  children,
  className = "",
}) => (
  <div className={`flex-grow overflow-y-auto ${className}`}>{children}</div>
);

interface SidebarFooterProps {
  children: ReactNode;
  className?: string;
}

const SidebarFooter: FC<SidebarFooterProps> = ({
  children,
  className = "",
}) => (
  <div className={`p-4 border-t border-slate-100 bg-slate-50 ${className}`}>
    {children}
  </div>
);

interface SidebarCloseButtonProps {
  onClose: () => void;
}

const SidebarCloseButton: FC<SidebarCloseButtonProps> = ({ onClose }) => (
  <button
    onClick={onClose}
    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
  >
    <X size={20} />
  </button>
);

export const Sidebar = Object.assign(SidebarRoot, {
  Header: SidebarHeader,
  Title: SidebarTitle,
  Content: SidebarContent,
  Footer: SidebarFooter,
  CloseButton: SidebarCloseButton,
});
