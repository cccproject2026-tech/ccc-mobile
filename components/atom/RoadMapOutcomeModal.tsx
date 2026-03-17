import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface RoadMapOutcomeModalProps {
  isMenuVisible: boolean;
  closeMenu: () => void;
}

type ModalStep = "SELECTION" | "DETAIL" | "DOWNLOAD";

export const RoadMapOutcomeModal = ({
  isMenuVisible,
  closeMenu,
}: RoadMapOutcomeModalProps) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>("SELECTION");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("");

  // Reset state when modal opens
  useEffect(() => {
    if (isMenuVisible) {
      setCurrentStep("SELECTION");
      setSelectedTimeframe("");
    }
  }, [isMenuVisible]);

  const outComeList = [
    {
      outcome: "The church is committed to the revitalization process.",
    },
    {
      outcome:
        "The Church is praying consistently and intentionally for revitalization.",
    },
    {
      outcome:
        "The church understands its current health and is committed to making improvements.",
    },
    {
      outcome:
        "The church is beginning to feel like a warm and welcoming place for new attendees.",
    },
    {
      outcome:
        "Church members have begun to build new relationships with people who have attended a community engagement event and its follow-up event.",
    },
    {
      outcome:
        "Church members will begin to feel a sense of hope for the future and begin expecting God to do something exciting in their church.",
    },
  ];

  const timeframes = [
    "Expected Outcome – 4 Months",
    "Expected Outcome – 6 Months",
    "Expected Outcome – 9 Months",
    "Expected Outcome – End of Year",
  ];

  const handleTimeframeSelect = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    setCurrentStep("DETAIL");
  };

  const handleDownloadPress = () => {
    setCurrentStep("DOWNLOAD");
  };

  const handleClose = () => {
    closeMenu();
    // Reset state after transition animation would typically finish
    setTimeout(() => {
      setCurrentStep("SELECTION");
      setSelectedTimeframe("");
    }, 300);
  };

  const renderSelectionStep = () => (
    <View style={styles.selectionContainer}>
      <View style={styles.selectionCard}>
        {timeframes.map((timeframe, index) => (
          <TouchableOpacity
            key={index}
            style={styles.timeframeOption}
            onPress={() => handleTimeframeSelect(timeframe)}
          >
            <Text style={styles.timeframeText}>{timeframe}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDetailStep = () => (
    <LinearGradient
      colors={["#16165C", "#14507C"]}
      style={styles.detailGradient}
    >
      <ScrollView>
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[Colors.lightBlueGradientTwo, Colors.darkBlueGradientTwo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradientBorder}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerText}>
                {selectedTimeframe.replace("–", "-")}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.listContainer}>
          <View style={styles.listBorder}>
            {outComeList.map((e, i) => (
              <View key={i} style={styles.listItem}>
                <Text>⭐</Text>
                <Text style={styles.listItemText}>{e.outcome}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity onPress={handleDownloadPress} style={styles.downloadButton}>
          <Image source={icons.download} style={{ width: 18, height: 18, tintColor: 'white' }} />
          <Text style={styles.downloadText}>Download</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleClose} style={styles.closeIcon}>
          <Image source={icons.close} style={{ width: 18, height: 18 }} />
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );

  const renderDownloadStep = () => (
    <View style={styles.downloadPreviewContainer}>
      <View style={styles.downloadPreviewCard}>
        <TouchableOpacity onPress={handleClose} style={styles.previewCloseIcon}>
            <Image source={icons.close} style={{ width: 16, height: 16, tintColor: '#14507C' }} />
        </TouchableOpacity>
        
        <View style={styles.previewHeader}>
            {/* Logo placeholder - using text as placeholder based on image description "The Center for Community Change" */}
            <View style={styles.logoPlaceholder}>
                {/* <Image source={require('@/assets/images/logo.png')} style={{width: 40, height: 40, resizeMode: 'contain'}} /> */}
                <View>
                    <Text style={styles.logoTextTitle}>The Center for</Text>
                    <Text style={styles.logoTextSubtitle}>Community Change</Text>
                </View>
            </View>
            
            <Text style={styles.previewTitle}>{selectedTimeframe.replace("–", "-")}</Text>
            <View style={styles.divider} />
        </View>

        <ScrollView style={styles.previewScroll} showsVerticalScrollIndicator={false}>
            {outComeList.map((e, i) => (
              <View key={i} style={styles.previewListItem}>
                <Text style={styles.previewBullet}>⭐</Text>
                <Text style={styles.previewListText}>{e.outcome}</Text>
              </View>
            ))}
        </ScrollView>

        <TouchableOpacity style={styles.savePdfButton} onPress={handleClose}>
            <Image source={icons.download} style={{ width: 16, height: 16, tintColor: '#14507C' }} />
            <Text style={styles.savePdfText}>Save PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={isMenuVisible}
      transparent={true}
      onRequestClose={handleClose}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[
                styles.modalContent, 
                currentStep === "SELECTION" ? styles.modalContentSelection : 
                currentStep === "DOWNLOAD" ? styles.modalContentDownload : styles.modalContentDetail
            ]}>
              {currentStep === "SELECTION" && renderSelectionStep()}
              {currentStep === "DETAIL" && renderDetailStep()}
              {currentStep === "DOWNLOAD" && renderDownloadStep()}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  modalContentSelection: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
  },
  modalContentDetail: {
    width: "90%",
    height: 610,
  },
  modalContentDownload: {
    width: "90%",
    height: 650, // Slightly taller for preview
    backgroundColor: "transparent", 
  },
  
  // Selection Step Styles
  selectionContainer: {
    backgroundColor: "white",
    borderRadius: 14,
  },
  selectionCard: {
    gap: 12,
  },
  timeframeOption: {
    paddingVertical: 12,
  },
  timeframeText: {
    fontSize: 16,
    color: "#14507C", // Dark blue color
    fontWeight: "500",
  },

  // Detail Step Styles
  detailGradient: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "white",
    padding: 10,
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 24,
  },
  headerGradientBorder: {
    padding: 2,
    borderRadius: 10,
    marginTop: 10,
  },
  headerContent: {
    backgroundColor: "#161b5f",
    borderRadius: 8,
    paddingHorizontal: 21,
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  listContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  listBorder: {
    width: "100%",
    flexDirection: "column",
    borderRadius: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#1391BC",
  },
  listItem: {
    width: "100%",
    flexDirection: "row",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 20,
  },
  listItemText: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.8)",
    paddingRight: 30,
  },
  downloadButton: {
    flexDirection: "row",
    gap: 8,
    margin: 10,
    alignItems: "center",
    marginTop: 16,
    marginLeft: 20,
  },
  downloadText: {
    textDecorationLine: "underline",
    fontSize: 15,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.8)",
  },
  closeIcon: {
    position: "absolute",
    top: 2,
    right: 4,
  },

  // Download Preview Step Styles
  downloadPreviewContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
  },
  downloadPreviewCard: {
    flex: 1,
    alignItems: 'center',
  },
  previewCloseIcon: {
    position: "absolute",
    top: -10,
    right: -10,
    padding: 10,
    zIndex: 10,
  },
  previewHeader: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  logoPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  logoTextTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  logoTextSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14507C',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#87CEEB', // Sky blue divider
    width: '100%',
  },
  previewScroll: {
    flex: 1,
    width: '100%',
  },
  previewListItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingRight: 10,
  },
  previewBullet: {
    marginRight: 10,
    fontSize: 12,
    color: '#F4C430', // Gold color for star
  },
  previewListText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    flex: 1,
  },
  savePdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  savePdfText: {
    color: '#14507C',
    textDecorationLine: 'underline',
    fontWeight: '500',
    fontSize: 14,
  },
});
