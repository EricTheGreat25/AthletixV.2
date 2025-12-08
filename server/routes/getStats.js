// getStats.js
import { supabase } from "../supabaseClient.js";

export const getStats = async () => {
  try {
    // Fetch all basketball stats and calculate averages
    const { data: basketballData, error: basketballError } = await supabase
      .from("basketball_stats")
      .select("user_id, points, assists, rebounds");

    if (basketballError) throw basketballError;

    const basketballStats = {};
    basketballData.forEach((row) => {
      if (!basketballStats[row.user_id]) {
        basketballStats[row.user_id] = { points: [], assists: [], rebounds: [] };
      }
      basketballStats[row.user_id].points.push(row.points || 0);
      basketballStats[row.user_id].assists.push(row.assists || 0);
      basketballStats[row.user_id].rebounds.push(row.rebounds || 0);
    });

    const basketballAverages = Object.entries(basketballStats).map(([user_id, stats]) => ({
      id: user_id,
      stats: [
        { label: "Points", value: (stats.points.reduce((a, b) => a + b, 0) / stats.points.length).toFixed(1) },
        { label: "Assists", value: (stats.assists.reduce((a, b) => a + b, 0) / stats.assists.length).toFixed(1) },
        { label: "Rebounds", value: (stats.rebounds.reduce((a, b) => a + b, 0) / stats.rebounds.length).toFixed(1) },
      ],
    }));

    // Volleyball
    const { data: volleyballData, error: volleyballError } = await supabase
      .from("volleyball_stats")
      .select("user_id, kills, blocks, aces");

    if (volleyballError) throw volleyballError;

    const volleyballStats = {};
    volleyballData.forEach((row) => {
      if (!volleyballStats[row.user_id]) {
        volleyballStats[row.user_id] = { kills: [], blocks: [], aces: [] };
      }
      volleyballStats[row.user_id].kills.push(row.kills || 0);
      volleyballStats[row.user_id].blocks.push(row.blocks || 0);
      volleyballStats[row.user_id].aces.push(row.aces || 0);
    });

    const volleyballAverages = Object.entries(volleyballStats).map(([user_id, stats]) => ({
      id: user_id,
      stats: [
        { label: "Kills", value: (stats.kills.reduce((a, b) => a + b, 0) / stats.kills.length).toFixed(1) },
        { label: "Blocks", value: (stats.blocks.reduce((a, b) => a + b, 0) / stats.blocks.length).toFixed(1) },
        { label: "Aces", value: (stats.aces.reduce((a, b) => a + b, 0) / stats.aces.length).toFixed(1) },
      ],
    }));

    // Football
    const { data: footballData, error: footballError } = await supabase
      .from("football_stats")
      .select("user_id, goals, assists, shots");

    if (footballError) throw footballError;

    const footballStats = {};
    footballData.forEach((row) => {
      if (!footballStats[row.user_id]) {
        footballStats[row.user_id] = { goals: [], assists: [], shots: [] };
      }
      footballStats[row.user_id].goals.push(row.goals || 0);
      footballStats[row.user_id].assists.push(row.assists || 0);
      footballStats[row.user_id].shots.push(row.shots || 0);
    });

    const footballAverages = Object.entries(footballStats).map(([user_id, stats]) => ({
      id: user_id,
      stats: [
        { label: "Goals", value: (stats.goals.reduce((a, b) => a + b, 0) / stats.goals.length).toFixed(1) },
        { label: "Assists", value: (stats.assists.reduce((a, b) => a + b, 0) / stats.assists.length).toFixed(1) },
        { label: "Shots", value: (stats.shots.reduce((a, b) => a + b, 0) / stats.shots.length).toFixed(1) },
      ],
    }));

    // Merge all
    const allStats = [...basketballAverages, ...volleyballAverages, ...footballAverages];

    return allStats;
  } catch (err) {
    console.error("Error fetching stats:", err);
    return [];
  }
};
