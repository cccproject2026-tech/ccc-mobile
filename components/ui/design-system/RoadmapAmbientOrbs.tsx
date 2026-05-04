import React from "react";
import { StyleSheet, View } from "react-native";

/** Soft background circles for depth on roadmap screens */
export function RoadmapAmbientOrbs() {
  return (
    <>
      <View style={styles.bgCircleTop} pointerEvents="none" />
      <View style={styles.bgCircleBottom} pointerEvents="none" />
    </>
  );
}

const styles = StyleSheet.create({
  bgCircleTop: {
    position: "absolute",
    top: -120,
    right: -110,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  bgCircleBottom: {
    position: "absolute",
    bottom: -90,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
});
