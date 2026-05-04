import {
	Body,
	Button,
	Container,
	Head,
	Html,
	Preview,
	Text,
} from "@react-email/components";
import { renderToStaticMarkup } from "react-dom/server";

interface AuthActionEmailProps {
	actionLabel: string;
	actionUrl: string;
	previewText: string;
	title: string;
}

function AuthActionEmailTemplate({
	actionLabel,
	actionUrl,
	previewText,
	title,
}: AuthActionEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body
				style={{ backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" }}
			>
				<Container
					style={{
						backgroundColor: "#ffffff",
						borderRadius: "8px",
						margin: "24px auto",
						maxWidth: "560px",
						padding: "24px",
					}}
				>
					<Text
						style={{ fontSize: "24px", fontWeight: "600", margin: "0 0 16px" }}
					>
						{title}
					</Text>
					<Text style={{ color: "#334155", margin: "0 0 20px" }}>
						Use the button below to continue.
					</Text>
					<Button
						href={actionUrl}
						style={{
							backgroundColor: "#0f172a",
							borderRadius: "6px",
							color: "#ffffff",
							display: "inline-block",
							padding: "10px 16px",
							textDecoration: "none",
						}}
					>
						{actionLabel}
					</Button>
					<Text style={{ color: "#64748b", marginTop: "20px" }}>
						If the button does not work, copy this URL:
					</Text>
					<Text
						style={{
							color: "#0f172a",
							fontSize: "12px",
							wordBreak: "break-all",
						}}
					>
						{actionUrl}
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

export function renderAuthActionEmail(props: AuthActionEmailProps): string {
	return `<!DOCTYPE html>${renderToStaticMarkup(
		<AuthActionEmailTemplate {...props} />
	)}`;
}
