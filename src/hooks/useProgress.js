import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { roadmapData } from '../data/roadmapData';

export function useProgress() {
  const { state } = useApp();

  return useMemo(() => {
    const totalSections = roadmapData.reduce((acc, t) => acc + t.sections.length, 0);
    const completedSections = Object.values(state.progress).filter(Boolean).length;
    const overallPercent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

    const tierProgress = roadmapData.map((tier, ti) => {
      const total = tier.sections.length;
      const completed = tier.sections.filter((_, si) => state.progress[`${ti}-${si}`]).length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        id: tier.id,
        label: tier.tier,
        name: tier.label,
        color: tier.color,
        total,
        completed,
        percent,
      };
    });

    const totalTopics = roadmapData.reduce(
      (acc, t) => acc + t.sections.reduce((a, s) => a + s.topics.length, 0),
      0
    );
    const completedTopics = Object.values(state.topicProgress).filter(Boolean).length;

    const recentlyCompleted = Object.entries(state.progress)
      .filter(([, v]) => v)
      .map(([key]) => {
        const [ti, si] = key.split('-').map(Number);
        const tier = roadmapData[ti];
        const section = tier?.sections[si];
        return section ? { key, title: section.title, tier: tier.tier, color: tier.color } : null;
      })
      .filter(Boolean)
      .slice(-5)
      .reverse();

    // ── Daily Tracker Computed Values ──
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = state.studyLogs?.[todayStr] || [];
    const todayMinutes = todayLogs.reduce((sum, l) => sum + (l.duration || 0), 0);
    const todayTopics = new Set(todayLogs.map(l => l.topicKey)).size;

    // Weekly minutes
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    let weeklyMinutes = 0;
    if (state.studyLogs) {
      Object.entries(state.studyLogs).forEach(([date, logs]) => {
        if (date >= weekStartStr) {
          logs.forEach(l => { weeklyMinutes += l.duration || 0; });
        }
      });
    }

    // Confidence stats
    const confValues = Object.values(state.confidence || {}).filter(v => v > 0);
    const avgConfidence = confValues.length > 0
      ? Math.round((confValues.reduce((a, b) => a + b, 0) / confValues.length) * 10) / 10
      : 0;
    const lowConfidenceTopics = confValues.filter(v => v <= 2).length;

    return {
      totalSections,
      completedSections,
      overallPercent,
      tierProgress,
      totalTopics,
      completedTopics,
      recentlyCompleted,
      todayMinutes,
      todayTopics,
      weeklyMinutes,
      avgConfidence,
      lowConfidenceTopics,
    };
  }, [state.progress, state.topicProgress, state.studyLogs, state.confidence]);
}

