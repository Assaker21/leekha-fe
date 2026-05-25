import { useState } from "react";

export default function Init() {
  const [code, setCode] = useState("");
  return (
    <div className="flex flex-col gap-2 items-center justify-center h-screen w-screen">
      <form className="flex flex-col gap-2 items-center justify-center">
        <input
          className="border w-80 focus:outline-none px-1 h-8"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
          }}
          required
        />
        <button className="bg-black text-white w-80 h-8 cursor-pointer hover:opacity-80">
          Join
        </button>
      </form>
      <span>or</span>
      <button className="bg-black text-white w-80 h-8 cursor-pointer hover:opacity-80">
        Start Private Game
      </button>
    </div>
  );
}
