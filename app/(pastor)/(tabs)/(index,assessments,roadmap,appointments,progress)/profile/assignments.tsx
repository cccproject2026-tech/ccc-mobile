import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import { Header } from "@/components/build-components";
import RoadmapCard from "@/components/director/ProgressRoadmapCard";
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from "@/components/director/TopBar";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { Colors } from "@/constants/Colors";
import { mockRevitalization } from '@/lib/roadmap/mock';
import type { RoadmapCardData, RoadmapCardStatus, Task } from '@/lib/roadmap/types';
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Assignment() {
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] =
    React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [tabs, setTabs] = React.useState("All");

  // Pick 4-5 random tasks from mockRevitalization as assignments
  const allTasks: Task[] = React.useMemo(() => Object.values(mockRevitalization.tasks), []);

  const pickRandom = (arr: Task[], n: number) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(n, copy.length));
  };

  const selectedTasks = React.useMemo(() => pickRandom(allTasks, 5), [allTasks]);

  const statusLabel = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'Not Started';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'BLOCKED':
        return 'Overdue';
      default:
        return 'Not Started';
    }
  };

  const convertTaskToCard = (task: Task): RoadmapCardData => {
    let status: RoadmapCardStatus = 'initial';
    if (task.status === 'COMPLETED') status = 'completed';
    else if (task.status === 'IN_PROGRESS') status = 'in-progress';
    else if (task.status === 'BLOCKED') status = 'due';
    else status = 'initial';

    return {
      image: task.meta?.coverImage,
      title: task.title,
      description: task.description,
      status,
      completedDate: task.status === 'COMPLETED' ? new Date().toISOString().slice(0, 10) : undefined,
      showArrow: task.status !== 'COMPLETED',
    };
  };


  const convertToRoadmapCardData = (oldData: any): RoadmapCardData => {
    let status: RoadmapCardStatus = 'initial';

    if (oldData.status === 'Completed') {
      status = 'completed';
    } else if (oldData.status === 'In Progress') {
      status = 'in-progress';
    } else if (oldData.status === 'Due') {
      status = 'due';
    } else if (oldData.status === 'Not Started Yet') {
      status = 'initial';
    }

    const taskProgress = oldData.taskStatus?.inProgress ? {
      completed: oldData.taskStatus.inProgress,
      total: 8 // Assuming total of 8 tasks based on original logic
    } : undefined;

    return {
      image: oldData.image,
      title: oldData.title,
      description: oldData.description,
      status: status,
      completedDate: oldData.completedTime,
      taskProgress: status !== 'completed' && status !== 'initial' ? taskProgress : undefined,
      showArrow: status !== 'completed',
    };
  };

  // const dummyRoadMaps = [
  //   {
  //     title: "Prayer and Visitation Strategy",
  //     assignment: true,
  //     description: "Finalize the teams vision for the church",
  //     time: "Completion Time Months 1 - 2",
  //     type: "course",
  //     read: false,
  //     sessionDate: "10 / 11 / 24",
  //     status: "Not Started Yet",
  //     completionDate: "20 Oct 2024",
  //     taskStatus: {
  //       notStarted: true,
  //       started: false,
  //       inProgress: 0,
  //       toComplete: 0,
  //       completed: false,
  //     },
  //     image: require("@/assets/images/roadmap.jpg"),
  //   },
  //   {
  //     assignment: true,
  //     title: "Calendar",
  //     description:
  //       "Finalize a vision team meeting schedule through the end of the year ",
  //     type: "note",
  //     time: "Completion Time Months 1 - 2",
  //     read: false,
  //     subPhase: true,
  //     status: "Not Started Yet",
  //     taskStatus: {
  //       notStarted: true,
  //       started: false,
  //       inProgress: 0,
  //       toComplete: 8,
  //       completed: false,
  //     },
  //     image: require("@/assets/images/roadmap.jpg"),
  //   },
  //   {
  //     assignment: true,
  //     title: "Prayer",
  //     description:
  //       " Prioritize church prayer times and meet consistently for prayer with your congregation",
  //     time: "Completion Time Months 10 - 12",
  //     type: "profile",
  //     read: true,
  //     status: "Not Started Yet",
  //     taskStatus: {
  //       notStarted: true,
  //       started: false,
  //       inProgress: 0,
  //       toComplete: 0,
  //       completed: false,
  //     },
  //     image: require("@/assets/images/roadmap.jpg"),
  //   },
  //   {
  //     assignment: true,
  //     title: "Mentoring Conversations",
  //     description: "Schedule two mentoring conversations with your mentor",
  //     time: "Completion Time Months 3 - 9",
  //     showBothDate: true,
  //     sessionDate: "10 / 11 / 24",
  //     type: "assignment",
  //     read: true,
  //     status: "Not Started Yet",
  //     taskStatus: {
  //       notStarted: true,
  //       started: false,
  //       inProgress: 0,
  //       toComplete: 18,
  //       completed: false,
  //     },
  //     image: require("@/assets/images/roadmap.jpg"),
  //   },
  // ];

  const availableTabs = [
    { tab: "All" },
    { tab: "Due" },
    { tab: "Not Started" },
    { tab: "In Progress" },
    { tab: "Completed" },
    { tab: "Overdue" },
    { tab: "Pending Review" },
    { tab: "On Hold" },
  ];

  // Convert selected tasks to card data and filter by tab
  const assignments = React.useMemo(() => selectedTasks.map(t => ({
    cardData: convertTaskToCard(t),
    statusLabel: statusLabel(t.status),
    task: t,
  })), [selectedTasks]);

  const filteredRoadMaps = assignments.filter((item) => {
    if (tabs === 'All') return true;
    return item.statusLabel === tabs;
  });

  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  return (
    <>
      <AppGradientBackground style={{ flex: 1 }}>
        <View style={{
          flex: 1
        }}>
          <TopBar role="Pastor" />

          {/* Header Section */}
          <View style={{ paddingBottom: 10 }}>
            <Header title="Assignments" showSettings={false} />
          </View>
          <TabSwitcher
            tabs={availableTabs.map(t => ({ key: t.tab, label: t.tab }))}
            activeTab={tabs}
            onChange={(key) => setTabs(key)}
          />
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: bottom * 1.3,
            }}
          >
            {/* Content Section */}
            <View
              style={{
                marginVertical: 10,
                paddingHorizontal: 16,
                width: "100%",
              }}
            >
              {filteredRoadMaps.map((e, i) => (
                <View key={`roadmap-${i}`} style={[{ width: '100%', paddingTop: i === 0 ? 15 : 0 }]}>
                  <RoadmapCard data={e.cardData}
                    onPress={() =>
                      router.push({
                        pathname: '/roadmap/[phaseId]/[itemId]',
                        params: {
                          phaseId: e.task.phaseId,
                          itemId: e.task.id,
                        },
                      }, {
                        withAnchor: true,
                      })
                    } />

                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Modal */}
        <RoadMapOutcomeModal
          isMenuVisible={isRoadmapModalVisible}
          closeMenu={() => setIsRoadmapModalVisible(false)}
        />
      </AppGradientBackground>
    </>
  );
}

