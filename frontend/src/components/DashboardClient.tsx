"use client";

import { useState, useEffect } from "react";
import { Poll } from "@/types/poll";
import { getWebSocketResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardClientProps {
  initialPoll: Poll;
}

const COLORS = ["#44403c", "#D9A299", "#DCC5B2", "#78716C", "#A8A29E", "#57534E"];

export function DashboardClient({ initialPoll }: DashboardClientProps) {
  const [poll, setPoll] = useState<Poll>(initialPoll);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_RETRIES = 5;

    const connect = () => {
      if (retryCount >= MAX_RETRIES) {
        console.error("Max WebSocket retries reached for Dashboard");
        return;
      }

      // Construct and log the full URL
      const wsResponse = getWebSocketResponse(poll.id);
      console.log(`[Dashboard] Connecting to WebSocket: ${wsResponse.url}`);
      ws = wsResponse;

      ws.onopen = () => {
        console.log("[Dashboard] WebSocket connected successfully");
        retryCount = 0;
      };

      ws.onmessage = (event) => {
        try {
          const result = JSON.parse(event.data);
          const updatedPoll = result.data || result;
          if (updatedPoll && updatedPoll.options) {
            setPoll(updatedPoll);
          }
        } catch (err) {
          console.error("[Dashboard] WebSocket message error:", err);
        }
      };

      ws.onclose = (event) => {
        if (!event.wasClean) {
          console.warn(`[Dashboard] WebSocket closed unexpectedly. Code: ${event.code}, Reason: ${event.reason || 'None'}`);
          retryCount++;
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          console.log(`[Dashboard] Retrying in ${delay}ms... (Attempt ${retryCount}/${MAX_RETRIES})`);
          reconnectTimeout = setTimeout(connect, delay);
        } else {
          console.log("[Dashboard] WebSocket closed cleanly");
        }
      };

      ws.onerror = (err) => {
        console.error("[Dashboard] WebSocket error occurred:", err);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [poll.id]);

  const totalVotes = (poll.options || []).reduce((sum, opt) => sum + opt.vote_count, 0);

  const data = (poll.options || []).map((opt) => ({
    name: opt.text,
    votes: opt.vote_count,
  }));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link href={`/poll/${poll.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{poll.question}</h1>
          <p className="text-muted-foreground font-medium">Live Dashboard • {totalVotes} total votes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-soft card-border overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-serif">Vote Distribution (Bar)</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center">
            {totalVotes > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#78716c', fontSize: 12, fontWeight: 500 }}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#78716c', fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #DCC5B2', 
                      boxShadow: '0 4px 12px rgba(28, 25, 23, 0.05)',
                      fontFamily: 'inherit'
                    }}
                    cursor={{ fill: '#FAF7F3' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="votes" fill="#44403c" radius={[6, 6, 0, 0]} barSize={40}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
                  <BarChart className="h-8 w-8 text-stone-300" />
                </div>
                <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Waiting for votes...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft card-border overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-serif">Vote Distribution (Pie)</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center">
            {totalVotes > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={5}
                    fill="#44403c"
                    dataKey="votes"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #DCC5B2', 
                      boxShadow: '0 4px 12px rgba(28, 25, 23, 0.05)',
                      fontFamily: 'inherit'
                    }} 
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
                  <PieChart className="h-8 w-8 text-stone-300" />
                </div>
                <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Waiting for votes...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
