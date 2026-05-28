import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Zap, Waves, Bell, Eye, EyeOff } from "lucide-react";

export default function PiShockControlApp() {
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [name, setName] = useState("LocalControlApp");
  const [duration, setDuration] = useState(1);
  const [intensity, setIntensity] = useState(10);
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [confirmShock, setConfirmShock] = useState(false);

  const valid = useMemo(() => username && apiKey && shareCode && name, [username, apiKey, shareCode, name]);

  async function sendCommand(op) {
    if (!valid) {
      setStatus("Missing username, API key, share code, or app name.");
      return;
    }

    if (op === "shock" && !confirmShock) {
      setStatus("Check the safety box before sending shock.");
      return;
    }

    const safeDuration = Math.max(1, Math.min(Number(duration) || 1, 15));
    const safeIntensity = Math.max(1, Math.min(Number(intensity) || 1, 100));

    const body = {
      Username: username.trim(),
      Apikey: apiKey.trim(),
      Code: shareCode.trim(),
      Name: name.trim(),
      Op: op === "shock" ? 0 : op === "vibrate" ? 1 : 2,
      Duration: safeDuration,
      Intensity: op === "beep" ? 0 : safeIntensity,
    };

    setBusy(true);
    setStatus(`Sending ${op}...`);

    try {
      const res = await fetch("https://do.pishock.com/api/apioperate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`${res.status}: ${text}`);
      setStatus(`Sent ${op}. Response: ${text || "OK"}`);
    } catch (err) {
      setStatus(`Failed: ${err.message}. If this is a browser CORS error, run it through a local backend/proxy.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PiShock API Controller</h1>
          <p className="text-sm text-slate-600">Local control panel using username, API key, and share code.</p>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="space-y-4 p-4 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="PiShock username" />
              </div>
              <div className="space-y-2">
                <Label>App name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="LocalControlApp" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>API key</Label>
                <div className="flex gap-2">
                  <Input type={showKey ? "text" : "password"} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Paste API key" />
                  <Button type="button" variant="outline" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Share code</Label>
                <Input value={shareCode} onChange={(e) => setShareCode(e.target.value)} placeholder="Required for API control" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="space-y-4 p-4 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Duration: {duration}s</Label>
                <Input type="range" min="1" max="15" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Intensity: {intensity}%</Label>
                <Input type="range" min="1" max="100" value={intensity} onChange={(e) => setIntensity(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Button disabled={busy || !valid} onClick={() => sendCommand("beep")} variant="outline" className="rounded-2xl">
                <Bell className="mr-2 h-4 w-4" /> Beep
              </Button>
              <Button disabled={busy || !valid} onClick={() => sendCommand("vibrate")} className="rounded-2xl">
                <Waves className="mr-2 h-4 w-4" /> Vibrate
              </Button>
              <Button disabled={busy || !valid} onClick={() => sendCommand("shock")} variant="destructive" className="rounded-2xl">
                <Zap className="mr-2 h-4 w-4" /> Shock
              </Button>
            </div>

            <label className="flex items-center gap-2 rounded-xl border p-3 text-sm">
              <input type="checkbox" checked={confirmShock} onChange={(e) => setConfirmShock(e.target.checked)} />
              I confirm shock is safe, consensual, and intentional.
            </label>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex gap-3 p-4 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{status}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
