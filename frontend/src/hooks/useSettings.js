import { useEffect, useState } from "react";
import System from "@/models/system";

export function useSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function fetchSettings() {
      const _settings = await System.keys();
      setSettings(_settings);
    }
    fetchSettings();
  }, []);

  return settings;
}
