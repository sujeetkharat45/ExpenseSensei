import React, { useContext } from "react";
import { ScrollView, Dimensions, Text, View, StyleSheet, Alert } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { AppContext } from "../Context/AppContext";
import { COLORS } from "../utils/colors";

const screenWidth = Dimensions.get("window").width;

export default function InsightsScreen() {
  const { transactions, getWeeklyStats, limit } = useContext(AppContext);
  const weeklyData = getWeeklyStats();
  const dailyLimit = limit ? (limit / 30).toFixed(0) : 0;

  const categoryData = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) { existing.population += curr.amount; }
      else {
        acc.push({
          name: curr.category || "Other",
          population: curr.amount,
          color: ["#7C3AED", "#22C55E", "#F43F5E", "#FACC15", "#06B6D4"][acc.length % 5],
          legendFontColor: "#94A3B8",
          legendFontSize: 12,
        });
      }
      return acc;
    }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
      <Text style={styles.title}>Insights 📊</Text>

      <Text style={styles.chartTitle}>7-Day Spending Velocity</Text>
      <View style={styles.chartCard}>
        <LineChart
          data={{
            labels: weeklyData.labels,
            datasets: [
              { data: weeklyData.datasets[0].data, color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})` },
              { data: Array(7).fill(parseFloat(dailyLimit)), color: (opacity = 0.3) => `rgba(244, 63, 94, ${opacity})`, withDots: false }
            ],
            legend: ["Actual", "Target"]
          }}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          bezier
          onDataPointClick={({ value }) => Alert.alert("Day Check", `You spent ₹${value}.`)}
          style={styles.chart}
        />
      </View>

      <Text style={styles.chartTitle}>Category Breakdown</Text>
      <View style={styles.chartCard}>
        <PieChart data={categoryData} width={screenWidth - 60} height={200} chartConfig={chartConfig} accessor={"population"} backgroundColor={"transparent"} paddingLeft={"15"} absolute />
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: COLORS.card,
  backgroundGradientTo: COLORS.card,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
  propsForDots: { r: "5", strokeWidth: "2", stroke: COLORS.primary }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 25, marginTop: 20 },
  chartTitle: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 15 },
  chartCard: { backgroundColor: COLORS.card, borderRadius: 25, padding: 15, marginBottom: 25, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  chart: { borderRadius: 16 }
});