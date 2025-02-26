import React from "react";
import { ReactNode } from "react";

interface LayoutProps {
	children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return <div>{children}</div>;
};

export default Layout;
