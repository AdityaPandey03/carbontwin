import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle } from
'../ui/card';
import { Slider } from '../ui/slider';
import { api } from '../../services/mockApi';
import { motion } from 'framer-motion';
export function WhatIfSimulator() {
  const [videoQuality, setVideoQuality] = useState([50]);
  const [acTemp, setAcTemp] = useState([50]);
  const [zombieTabs, setZombieTabs] = useState([50]);
  const [simulation, setSimulation] = useState({
    savingsPercent: 0,
    carbonSavedKg: 0,
    rupeesSavedInr: 0
  });
  useEffect(() => {
    const runSimulation = async () => {
      // Aggregate simulation results
      const vq = await api.simulator.whatIf('videoQuality', videoQuality[0]);
      const ac = await api.simulator.whatIf('acTemp', acTemp[0]);
      const zt = await api.simulator.whatIf('zombieTabs', zombieTabs[0]);
      setSimulation({
        savingsPercent:
        vq.savingsPercent + ac.savingsPercent + zt.savingsPercent,
        carbonSavedKg: vq.carbonSavedKg + ac.carbonSavedKg + zt.carbonSavedKg,
        rupeesSavedInr:
        vq.rupeesSavedInr + ac.rupeesSavedInr + zt.rupeesSavedInr
      });
    };
    runSimulation();
  }, [videoQuality, acTemp, zombieTabs]);
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>What-If Simulator</CardTitle>
        <CardDescription>
          Adjust habits to see projected savings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Video Quality</label>
            <span className="text-sm text-muted-foreground">
              {videoQuality[0] < 33 ?
              '4K' :
              videoQuality[0] < 66 ?
              '1080p' :
              '720p'}
            </span>
          </div>
          <Slider
            value={videoQuality}
            onValueChange={setVideoQuality}
            max={100}
            step={1}
            className="[&_[role=slider]]:bg-emerald-500" />
          
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="text-sm font-medium">AC Thermostat</label>
            <span className="text-sm text-muted-foreground">
              {Math.round(18 + acTemp[0] / 100 * 8)}°C
            </span>
          </div>
          <Slider
            value={acTemp}
            onValueChange={setAcTemp}
            max={100}
            step={1}
            className="[&_[role=slider]]:bg-emerald-500" />
          
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Open Tabs</label>
            <span className="text-sm text-muted-foreground">
              {Math.round(100 - zombieTabs[0])} tabs
            </span>
          </div>
          <Slider
            value={zombieTabs}
            onValueChange={setZombieTabs}
            max={100}
            step={1}
            className="[&_[role=slider]]:bg-emerald-500" />
          
        </div>

        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Projected CO₂ Savings
              </p>
              <motion.p
                key={simulation.carbonSavedKg}
                initial={{
                  scale: 1.1,
                  color: '#10b981'
                }}
                animate={{
                  scale: 1,
                  color: '#e5e7eb'
                }}
                className="text-xl font-bold">
                
                {simulation.carbonSavedKg.toFixed(2)} kg
              </motion.p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Projected ₹ Savings
              </p>
              <motion.p
                key={simulation.rupeesSavedInr}
                initial={{
                  scale: 1.1,
                  color: '#10b981'
                }}
                animate={{
                  scale: 1,
                  color: '#e5e7eb'
                }}
                className="text-xl font-bold">
                
                ₹{simulation.rupeesSavedInr.toFixed(2)}
              </motion.p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);

}