import { useEffect, useRef, useState } from "react";
import { titleCase } from "text-case";
import Admin from "@/models/admin";
import { Trash } from "@phosphor-icons/react";

export default function InviteRow({ invite, allowSocialProvider = false }) {
  const rowRef = useRef(null);
  const [status, setStatus] = useState(invite.status);
  const [[regularUserCopied, socialProviderCopied], setCopied] = useState([
    false,
    false,
  ]); // [userPass, socialProvider];

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to deactivate this invite?\nAfter you do this it will not longer be useable.\n\nThis action is irreversible.`
      )
    )
      return false;
    if (rowRef?.current) {
      rowRef.current.children[0].innerText = "Disabled";
    }
    setStatus("disabled");
    await Admin.disableInvite(invite.id);
  };
  const copyInviteLink = (withSocialProvider) => {
    if (!invite) return false;
    window.navigator.clipboard.writeText(
      `${window.location.origin}/accept-invite/${invite.code}?withSocialProvider=${withSocialProvider}`
    );
    setCopied([
      withSocialProvider ? regularUserCopied : true,
      withSocialProvider ? true : socialProviderCopied,
    ]);
  };

  useEffect(() => {
    function resetStatus() {
      if (!regularUserCopied || !socialProviderCopied) return false;
      setTimeout(() => {
        setCopied([false, false]);
      }, 3000);
    }
    resetStatus();
  }, [regularUserCopied, socialProviderCopied]);

  return (
    <>
      <tr
        ref={rowRef}
        className="bg-transparent text-white text-opacity-80 text-sm font-medium"
      >
        <td scope="row" className="px-6 py-4 whitespace-nowrap">
          {titleCase(status)}
        </td>
        <td className="px-6 py-4">
          {invite.claimedBy
            ? invite.claimedBy?.username || "deleted user"
            : "--"}
        </td>
        <td className="px-6 py-4">
          {invite.createdBy?.username || "deleted user"}
        </td>
        <td className="px-6 py-4">{invite.createdAt}</td>
        <td className="px-6 py-4 flex items-center gap-x-6">
          {status === "pending" && (
            <>
              <div className="flex flex-col gap-2 place-items-start">
                <button
                  onClick={() => copyInviteLink(false)}
                  disabled={regularUserCopied}
                  className="font-medium text-blue-300 rounded-lg hover:text-white hover:text-opacity-60 hover:underline"
                >
                  {regularUserCopied
                    ? "Copied"
                    : "Copy Invite Link with user/password"}
                </button>
                <button
                  onClick={() => copyInviteLink(true)}
                  disabled={socialProviderCopied}
                  className="font-medium text-blue-300 rounded-lg hover:text-white hover:text-opacity-60 hover:underline"
                >
                  {socialProviderCopied
                    ? "Copied"
                    : "Copy Invite Link with Social Login"}
                </button>
              </div>
              <td className="px-6 py-4 flex items-center gap-x-6">
                <button
                  onClick={handleDelete}
                  className="font-medium text-red-300 px-2 py-1 rounded-lg hover:bg-red-800 hover:bg-opacity-20"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </td>
            </>
          )}
        </td>
      </tr>
    </>
  );
}
