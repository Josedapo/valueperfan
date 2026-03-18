import { ImageResponse } from "next/og";
import { getAccount, getAccountsByPlatform } from "../../../../../lib/data";
import { formatCurrency, formatVPF, formatFollowers } from "../../../../../lib/utils";

export const runtime = "edge";
export const alt = "ValuePerFan Account Valuation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; platform: string; handle: string }>;
}) {
  const { platform, handle } = await params;
  const account = getAccount(platform, handle);

  if (!account) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#0a0a0a",
            color: "#ffffff",
            fontSize: 48,
            fontWeight: "bold",
          }}
        >
          Account Not Found
        </div>
      ),
      { ...size }
    );
  }

  const pLabel = platform === "instagram" ? "Instagram" : "TikTok";
  const globalTotal = getAccountsByPlatform(account.platform).length;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          padding: "48px 56px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            <span style={{ color: "#22c55e" }}>Value</span>
            <span style={{ color: "#ffffff" }}>Per</span>
            <span style={{ color: "#22c55e" }}>Fan</span>
          </div>
          <span
            style={{
              color: "#6b7280",
              fontSize: "20px",
            }}
          >
            {pLabel}
          </span>
        </div>

        {/* Account info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontSize: "42px",
                fontWeight: "bold",
                lineHeight: "1.1",
              }}
            >
              {account.name}
            </span>
            <span
              style={{
                color: "#9ca3af",
                fontSize: "24px",
                marginTop: "4px",
              }}
            >
              @{account.handle}
            </span>
          </div>
        </div>

        {/* Value cards */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#052e16",
              borderRadius: "16px",
              padding: "24px 40px",
              flex: "1",
            }}
          >
            <span style={{ color: "#9ca3af", fontSize: "16px" }}>
              Total Value
            </span>
            <span
              style={{
                color: "#22c55e",
                fontSize: "48px",
                fontWeight: "bold",
                marginTop: "4px",
              }}
            >
              {formatCurrency(account.totalValue)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#052e16",
              borderRadius: "16px",
              padding: "24px 40px",
              flex: "1",
            }}
          >
            <span style={{ color: "#9ca3af", fontSize: "16px" }}>
              Value Per 1K Fans
            </span>
            <span
              style={{
                color: "#22c55e",
                fontSize: "48px",
                fontWeight: "bold",
                marginTop: "4px",
              }}
            >
              {formatVPF(account.valuePerFan)}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#1a1a1a",
              borderRadius: "12px",
              padding: "16px 32px",
              flex: "1",
            }}
          >
            <span style={{ color: "#6b7280", fontSize: "14px" }}>
              Global Rank
            </span>
            <span
              style={{
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "2px",
              }}
            >
              #{account.rank.vpf}
            </span>
            <span style={{ color: "#6b7280", fontSize: "12px" }}>
              of {globalTotal.toLocaleString()}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#1a1a1a",
              borderRadius: "12px",
              padding: "16px 32px",
              flex: "1",
            }}
          >
            <span style={{ color: "#6b7280", fontSize: "14px" }}>
              Followers
            </span>
            <span
              style={{
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "2px",
              }}
            >
              {formatFollowers(account.followers)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#1a1a1a",
              borderRadius: "12px",
              padding: "16px 32px",
              flex: "1",
            }}
          >
            <span style={{ color: "#6b7280", fontSize: "14px" }}>
              Category
            </span>
            <span
              style={{
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: "bold",
                marginTop: "2px",
              }}
            >
              {account.category}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "auto",
          }}
        >
          <span style={{ color: "#6b7280", fontSize: "16px" }}>
            valueperfan.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
