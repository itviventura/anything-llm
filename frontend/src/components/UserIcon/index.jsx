import React, { memo, useRef } from "react";
import usePfp from "../../hooks/usePfp";
import UserDefaultPfp from "./user.svg";

const UserIcon = memo(({ role, user }) => {
  const { pfp } = usePfp();
  const divRef = useRef(null);
  const seed = user?.uid
    ? toPseudoRandomInteger(user.uid)
    : Math.floor(100000 + Math.random() * 900000);

  useEffect(() => {
    if (!divRef.current || (role === "user" && pfp)) return;
    const result = JAZZ(size, seed);
    divRef.current.appendChild(result);
  }, [pfp, role, seed, size]);

  return (
    <div className="relative w-[35px] h-[35px] rounded-full flex-shrink-0 overflow-hidden">
      {/* <div ref={divRef} /> */}
      {role === "assistant" && (
        <img
          src="https://storage.googleapis.com/media_ventura_travel/vbot-avatar.png"
          alt="User profile picture"
          className="absolute top-0 left-0 w-full h-full object-cover rounded-full"
        />
      )}
    </div>
  );
});

export default UserIcon;
