import { Assessment } from "./types";

export const dummyRoadMaps: Assessment[] = [
    {
        id: "assessment_001",
        type: "CMA",
        title: "Church Assessment Evaluation(CMA)",
        description: "Review the overall health of your church",
        status: "Due",
        dueDate: "25 Oct 2024",
        guidelines: [
            "Please complete assessment in a single session without interruptions.",
            "It is a review of your church's current state.",
            "Beginning to return to previous sections is not permitted.",
            "The assessment consists of sections.",
            "The assessment should take approximately 45 minutes."
        ],
        preSurvey: [
            { id: "q1", text: "What is your current church membership?", type: "number", placeholder: "Enter number", required: true },
            { id: "q2", text: "How many active members do you have currently?", type: "number", placeholder: "Enter number", required: true },
            { id: "q3", text: "How many baptisms in the last two years?", type: "number", placeholder: "Enter number", required: true },
        ],
        sections: [
            {
                title: "Congregational Well Being",
                subtitle: "Select the option in each box that most accurately reflects the health of your church and community engagement.",
                questionGroups: [
                    {
                        id: "group1",
                        questions: [
                            { id: "q1", text: "The average age of church members is significantly higher than the surrounding community", type: "checkbox" },
                            { id: "q2", text: "The average age of church members is somewhat higher than the surrounding community", type: "checkbox" },
                            { id: "q3", text: "The membership has been on the rise", type: "checkbox" },
                            { id: "q4", text: "The church exhibits diversity of generations (GE) and community engagement (CE)", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group2",
                        questions: [
                            { id: "q5", text: "Many members are home bound due to illness", type: "checkbox" },
                            { id: "q6", text: "Church attendance has been declining", type: "checkbox" },
                            { id: "q7", text: "Younger people have been increasing attendance", type: "checkbox" },
                            { id: "q8", text: "Attendance has grown significantly over the last few years", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group3",
                        questions: [
                            { id: "q9", text: "Most of the members reside within 10 miles of the church", type: "checkbox" },
                            { id: "q10", text: "At least half of the church members live within 10 miles of the church", type: "checkbox" },
                            { id: "q11", text: "The majority of the church members live within 0 miles of the church", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group4",
                        questions: [
                            { id: "q12", text: "There are more funerals than weddings and child dedications", type: "checkbox" },
                            { id: "q13", text: "There have been some funerals and child dedications in the last few years", type: "checkbox" },
                            { id: "q14", text: "Weddings and child dedications have been taking place almost every month", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group5",
                        questions: [
                            { id: "q15", text: "Many members feel burnt out (BBO)", type: "checkbox" },
                            { id: "q16", text: "The % of volunteer participation is very low", type: "checkbox" },
                            { id: "q17", text: "Organizational volunteer participation is increasing", type: "checkbox" },
                            { id: "q18", text: "The majority of the members are engaged in volunteering", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group6",
                        questions: [
                            { id: "q19", text: "Leaders hear a lot of complaints about the future of the church", type: "checkbox" },
                            { id: "q20", text: "The church members and attendees feel hopeful about the future of the church", type: "checkbox" },
                            { id: "q21", text: "The church members and attendees are excited about inviting their friends to church worship or social events", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group7",
                        questions: [
                            { id: "q22", text: "The church building(s) is/are in need of significant renovation", type: "checkbox" },
                            { id: "q23", text: "The church property needs a serious fix from some area of the church building(s) can benefit from renovation", type: "checkbox" },
                            { id: "q24", text: "The church building is aesthetically appealing and culturally relevant", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group8",
                        questions: [
                            { id: "q25", text: "Children's classes are very small and inconsistent", type: "checkbox" },
                            { id: "q26", text: "Children's classes have been conducted by the same people and the same way for many years", type: "checkbox" },
                            { id: "q27", text: "Children's classes are organized in collaboration with other churches", type: "checkbox" },
                            { id: "q28", text: "Children's classes demonstrate the deep education and excitement parents are playing a role and inviting neighbors and friends", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group9",
                        questions: [
                            { id: "q29", text: "The church's social events are sourced and hardly anybody from the surrounding community", type: "checkbox" },
                            { id: "q30", text: "The church has been hosting a few community-oriented social events", type: "checkbox" },
                            { id: "q31", text: "The church is intentional about regularly hosting community events", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group10",
                        questions: [
                            { id: "q32", text: "Tithing has been declining for the past 5 years", type: "checkbox" },
                            { id: "q33", text: "Tithing has remained steady—most of the annual budget for the past 2 years", type: "checkbox" },
                            { id: "q34", text: "Tithing and giving has been steadily rising for the last 3-5 years", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group11",
                        questions: [
                            { id: "q35", text: "The church budget is spent on building/maintenance, not ministries", type: "checkbox" },
                            { id: "q36", text: "The church has started a few new ministries in the last 3 years", type: "checkbox" },
                            { id: "q37", text: "The church invests significantly into new ministries", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group12",
                        questions: [
                            { id: "q38", text: "There has been a decline in the number of baptisms", type: "checkbox" },
                            { id: "q39", text: "Very few adult and older baptisms", type: "checkbox" },
                            { id: "q40", text: "Adult baptisms take place on a regular basis and include people living in the surrounding community", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group13",
                        questions: [
                            { id: "q41", text: "Only the pastor conducts bible studies, not many members", type: "checkbox" },
                            { id: "q42", text: "Only very few people, including the pastor, conduct studies or spiritually mentor", type: "checkbox" },
                            { id: "q43", text: "A significant number of church leaders and members involved in individual or group bible studies outside of Sabbath worship time", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group14",
                        questions: [
                            { id: "q44", text: "Prayer meetings feel more like social bible study and not attended by many", type: "checkbox" },
                            { id: "q45", text: "Prayer meetings are well-attended—a significant portion of members devoted to it", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group15",
                        questions: [
                            { id: "q46", text: "First-time visitors rarely return", type: "checkbox" },
                            { id: "q47", text: "Many visitors tend to return to the church's worship services or social activities", type: "checkbox" },
                            { id: "q48", text: "New people come to check out the church almost every week and stay long around", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group16",
                        questions: [
                            { id: "q49", text: "Members rarely invite their friends and neighbors to the church", type: "checkbox" },
                            { id: "q50", text: "Members occasionally introduce their friends and neighbors to the church", type: "checkbox" },
                            { id: "q51", text: "Members regularly invite their friends and neighbors using a discipleship-making strategy", type: "checkbox" },
                        ]
                    },
                ]
            },
            {
                title: "Leadership Style",
                subtitle: "Select the option in each box that most accurately reflects the engagement of your church and community (Elders, Church Board, etc.)",
                questionGroups: [
                    {
                        id: "group1",
                        questions: [
                            { id: "q1", text: "The CB spends all of its time and energy focusing on logistical (maintenance and operations) issues", type: "checkbox" },
                            { id: "q2", text: "The CB spends the most of its time and energy focusing on operations instead of ministries or evangelism", type: "checkbox" },
                            { id: "q3", text: "The CB dedicates at least 1/2 its time and energy discussing ways to demonstrate Christ’s neighborly community", type: "checkbox" },
                            { id: "q4", text: "The CB dedicates the most of its time and efforts to CMA (transformative methods of evangelism)", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group2",
                        questions: [
                            { id: "q5", text: "The CB meetings are tense, reflecting divisions in the church", type: "checkbox" },
                            { id: "q6", text: "The CB meetings feel formal and uninspiring, lacking a genuine sense of enjoyment from doing God’s work", type: "checkbox" },
                            { id: "q7", text: "The CB meetings always keep in mind the church’s vision and mission and leaders of the church", type: "checkbox" },
                            { id: "q8", text: "The CB meetings are full of energy and grace—the board members look forward to spending time with one another", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group3",
                        questions: [
                            { id: "q9", text: "The CB is not representative of all of the church’s demographics and members (doesn’t share the same vision & mission for the church)", type: "checkbox" },
                            { id: "q10", text: "Not all CB members subscribe to the church’s vision and mission", type: "checkbox" },
                            { id: "q11", text: "The CB is united regarding the church’s vision and mission", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group4",
                        questions: [
                            { id: "q12", text: "All board members are on the same page regarding the vision and mission of the church, and they have developed a custom CB", type: "checkbox" },
                            { id: "q13", text: "The CB represents the most of their time putting out ‘fires’", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group5",
                        questions: [
                            { id: "q14", text: "The CB is not representative of younger members of the congregation", type: "checkbox" },
                            { id: "q15", text: "At least half of the church’s life is oriented toward serving the surrounding communities", type: "checkbox" },
                            { id: "q16", text: "The overall focus of the leadership is directed toward a transformative presence in the community", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group6",
                        questions: [
                            { id: "q17", text: "There is a certain level of toxicity within church leadership", type: "checkbox" },
                            { id: "q18", text: "The church leaders have to deal with a few toxic members all the time", type: "checkbox" },
                            { id: "q19", text: "There are healthy practices regarding dealing with toxicity in the church", type: "checkbox" },
                            { id: "q20", text: "The leaders hold each other accountable in terms of raising the next generation of leaders", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group7",
                        questions: [
                            { id: "q21", text: "The local church leaders don’t participate in many ministries outside of the church (don’t perform much other than formal duties during the worship hour)", type: "checkbox" },
                            { id: "q22", text: "Church leaders rarely talk about serving outside of church", type: "checkbox" },
                            { id: "q23", text: "Most church leaders participate outside of church in ministries", type: "checkbox" },
                            { id: "q24", text: "The outside leaders are involved in communal outside of church", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group8",
                        questions: [
                            { id: "q25", text: "It feels like only a few of the leaders run the church (they make vital decisions unilaterally)", type: "checkbox" },
                            { id: "q26", text: "The majority of long-term leadership are not willing to step down from leadership positions", type: "checkbox" },
                            { id: "q27", text: "A few new and younger church leaders have recently emerged", type: "checkbox" },
                            { id: "q28", text: "No one holds on to their position for long—leaders are always preparing emerging leaders to eventually replace them", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group9",
                        questions: [
                            { id: "q29", text: "The majority of church members vehemently resist making any changes", type: "checkbox" },
                            { id: "q30", text: "Despite what they say, it feels like the congregation are not open to changes", type: "checkbox" },
                            { id: "q31", text: "Many church members realize that internal & external transformation is the primary mission of the church—the congregation is open to them but does not know how to implement", type: "checkbox" },
                            { id: "q32", text: "The congregation understands inevitability of change—still regularly practice of discipleship opportunities for everyone to be heard", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group10",
                        questions: [
                            { id: "q33", text: "There is no intentional discipling program for raising the next generation of leaders and leadership clearly aging", type: "checkbox" },
                            { id: "q34", text: "Very little leadership discipling and mentoring takes place", type: "checkbox" },
                            { id: "q35", text: "There is a strong sense of commitment to raising the next generation of leaders", type: "checkbox" },
                            { id: "q36", text: "Raising and supporting spiritual leaders is one of the top priorities in the life of the church— the church is intentional about mentoring & empowering its formal and informal leaders", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group11",
                        questions: [
                            { id: "q37", text: "The church leaders have no personal connections with one another", type: "checkbox" },
                            { id: "q38", text: "Very little social interaction takes place among the church leaders outside of the church", type: "checkbox" },
                            { id: "q39", text: "The church leaders seek ways to engage socially with one another", type: "checkbox" },
                            { id: "q40", text: "All church leaders, formal and informal, regularly spend time socially and spiritually with one another", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group12",
                        questions: [
                            { id: "q41", text: "Church leaders tend to choose accusatory rather than grace-oriented ways of dealing with challenges", type: "checkbox" },
                            { id: "q42", text: "Among the leaders, avoidance is the primary way of dealing with challenges—there is no accountability system in place", type: "checkbox" },
                            { id: "q43", text: "The church leaders openly acknowledge problems without blaming one another or avoiding the church leadership", type: "checkbox" },
                            { id: "q44", text: "The church leadership is deeply committed to maintaining mutual accountability and support of one another—the leaders practice organic and adaptive leadership styles", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group13",
                        questions: [
                            { id: "q45", text: "The leadership nominating process is church politics, if not dreadful, because of the church politics", type: "checkbox" },
                            { id: "q46", text: "The nominating process is viewed as an invitation to seeking further guidance of the church’s life rather than how milestones in the church are met", type: "checkbox" },
                        ]
                    },
                ]
            },
            {
                title: "Section 3: Community Engagement History",
                subtitle: "Select the option in each box that most accurately reflects the health of your church and its community engagement.",
                questionGroups: [
                    {
                        id: "group1",
                        questions: [
                            { id: "q1", text: "The church has no consistent partnerships with non-Adventist organizations", type: "checkbox" },
                            { id: "q2", text: "Church does not fully understand the CMA approach in relationship to evangelism", type: "checkbox" },
                            { id: "q3", text: "The congregation fully embraces the CMA approach in ministry and evangelism", type: "checkbox" },
                            { id: "q4", text: "The church fully implements the CMA approach in all areas of its life—inwardly and outwardly", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group2",
                        questions: [
                            { id: "q5", text: "The church solely focuses on addressing the needs of its members", type: "checkbox" },
                            { id: "q6", text: "Some sporadic relationships with local community influencers and players", type: "checkbox" },
                            { id: "q7", text: "The church conspicuously participates in the community life outside of the church", type: "checkbox" },
                            { id: "q8", text: "The church has a designated leadership role for organizing community life outside of the church—this leader conducts formal training classes/workshops on CE for other churches", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group3",
                        questions: [
                            { id: "q9", text: "The church is too focused on addressing the needs of its members & does not participate in community engagement", type: "checkbox" },
                            { id: "q10", text: "The community services feel more like proselytizing through distribution of goods than fostering relationships", type: "checkbox" },
                            { id: "q11", text: "The community services provide ample volunteer opportunities for people outside of the church", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group4",
                        questions: [
                            { id: "q12", text: "Many unchurched community-service volunteers become interested in the life of the church", type: "checkbox" },
                            { id: "q13", text: "Church members can’t accurately name the surrounding area community issues in the community", type: "checkbox" },
                            { id: "q14", text: "Only a few of the church’s members participate in the life of the community outside of the church", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group5",
                        questions: [
                            { id: "q15", text: "The church has good relationships with local businesses, a few church members hold prominent leadership roles in community (C3) organizations outside of the church", type: "checkbox" },
                            { id: "q16", text: "Engaged in joint ventures with local businesses, government entities, and other non-profits", type: "checkbox" },
                            { id: "q17", text: "No active partnerships exist with neighboring educational institutions", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group6",
                        questions: [
                            { id: "q18", text: "Only a few students and faculty members from neighboring higher education institutions participate in the life of the church", type: "checkbox" },
                            { id: "q19", text: "The church actively engages students and faculty from local higher education institutions", type: "checkbox" },
                            { id: "q20", text: "The church has formal partnership/joint projects with neighboring higher education institutions", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group7",
                        questions: [
                            { id: "q21", text: "Neighbors have no knowledge or hold a negative view of the church", type: "checkbox" },
                            { id: "q22", text: "Many neighbors are aware and hold a positive view of the church", type: "checkbox" },
                            { id: "q23", text: "The church does not see itself existing without being actively present in the lives of its neighbors", type: "checkbox" },
                        ]
                    },
                ]
            },
            {
                title: "Section 4: Pastoral Leadership",
                subtitle: "Select the option in each box that most accurately reflects the health of the pastor. This section to be completed by an individual or pastoral team.",
                questionGroups: [
                    {
                        id: "group1",
                        questions: [
                            { id: "q1", text: "The pastor feels like they have to speak (confronting) the congregation rather than for (inspiring) the congregation", type: "checkbox" },
                            { id: "q2", text: "The pastor feels like they have to constantly mediate between factions at the church", type: "checkbox" },
                            { id: "q3", text: "The pastor spends most of their time empowering church leaders", type: "checkbox" },
                            { id: "q4", text: "The pastor spends most of their time given mentoring and being mentored", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group2",
                        questions: [
                            { id: "q5", text: "The pastor does not feel supported by the majority of the church members", type: "checkbox" },
                            { id: "q6", text: "Church members feel the pastor is apathetic—feels the pastor does not care and is required without putting the heart and soul into pastoral ministry", type: "checkbox" },
                            { id: "q7", text: "The church members feel the pastor and passion articulated by the pastor", type: "checkbox" },
                            { id: "q8", text: "The pastor inspires and leads pastor and partners in community-transformation initiatives and projects", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group3",
                        questions: [
                            { id: "q9", text: "The most of the pastor’s time is spent dealing with internal issues and conflicts", type: "checkbox" },
                            { id: "q10", text: "The pastor spends at least 75% of their time with the internal church and its conflicts and business", type: "checkbox" },
                            { id: "q11", text: "The pastor is intentional dedicating at least 25% of their time about fostering relationships they face very little toxicity at the church", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group4",
                        questions: [
                            { id: "q12", text: "The pastor is deeply involved in the life of the surrounding community, developing personal accountability circle advising them on the issues of leadership and spiritual personal growth", type: "checkbox" },
                            { id: "q13", text: "The pastor doesn’t have any formal community engagement/services-training/certification", type: "checkbox" },
                            { id: "q14", text: "Very limited community engagement/services training", type: "checkbox" },
                            { id: "q15", text: "The pastor is enrolled to obtain formal training in the area of CE through the CMA", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group5",
                        questions: [
                            { id: "q16", text: "The pastor trains other pastors and leaders in the area of CE through the CMA", type: "checkbox" },
                            { id: "q17", text: "The pastor doesn’t have a clear growth strategy", type: "checkbox" },
                            { id: "q18", text: "The pastor has a vision for the church but doesn’t have energy or support to adequately cast it", type: "checkbox" },
                            { id: "q19", text: "The pastor constantly makes an effort to communicate the church’s vision and mission in the light of the CMA and the Cycle of Evangelism", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group6",
                        questions: [
                            { id: "q20", text: "The pastor is committed to encompassing CMA and the Cycle of Evangelism", type: "checkbox" },
                            { id: "q21", text: "Preaching can be described as uninspiring and patronizing (prophetical and (confronting) people rather than (inspiring) the people)", type: "checkbox" },
                            { id: "q22", text: "Preaching is Christ-centered, inspiring, and transformative—the pastor moralistic and prescriptive—the pastor speaks to the people, of the community", type: "checkbox" },
                            { id: "q23", text: "The pastor preach intentionally incorporates the needs of others to preach in the Christ-centered manner", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group7",
                        questions: [
                            { id: "q24", text: "If called somewhere else the pastor would leave the church without hesitation", type: "checkbox" },
                            { id: "q25", text: "The pastor shows deep care for church and community stakeholders", type: "checkbox" },
                            { id: "q26", text: "The pastor can’t see themselves being anywhere else but with the church and the community in which they currently serve", type: "checkbox" },
                        ]
                    },
                ]
            },
            {
                title: "Section 5: Christ's Method Alone (CMA) and Cycle of Evangelism",
                subtitle: "Select the option in each box that relates to how Christ Method Alone is being practiced in your community.",
                questionGroups: [
                    {
                        id: "group1",
                        questions: [
                            { id: "q1", text: "CMA is not embodied in the life of the church", type: "checkbox" },
                            { id: "q2", text: "Church not fully understanding the CMA approach in relationship to evangelism", type: "checkbox" },
                            { id: "q3", text: "Congregation has a good grasp but has not fully implemented practices of CMA", type: "checkbox" },
                            { id: "q4", text: "The church is fully committed to and practices the CMA approach", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group2",
                        questions: [
                            { id: "q5", text: "Little variety in methods of evangelism over the last twenty years", type: "checkbox" },
                            { id: "q6", text: "There is no connection between evangelism efforts and the community engagement", type: "checkbox" },
                            { id: "q7", text: "The church sees CE as a transformative form of evangelism rather than a transactional activity", type: "checkbox" },
                            { id: "q8", text: "The church has a clear plan for further growth and transformative development", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group3",
                        questions: [
                            { id: "q9", text: "Serving the community is not considered to be the focus of the church's life and ministries", type: "checkbox" },
                            { id: "q10", text: "Only a few members see the vitality of the service to the community as an integral part of evangelistic foci", type: "checkbox" },
                            { id: "q11", text: "The church members share a vision of embodying CMA as the future of church", type: "checkbox" },
                            { id: "q12", text: "The church is networked with other congregations, which embody the CMA as its primary guiding principle", type: "checkbox" },
                        ]
                    },
                    {
                        id: "group4",
                        questions: [
                            { id: "q13", text: "The church has no functional awareness of the surrounding community's needs", type: "checkbox" },
                            { id: "q14", text: "The church has only observed some of the community's needs", type: "checkbox" },
                            { id: "q15", text: "The church has surveyed the community, assessing its needs and aspirations", type: "checkbox" },
                            { id: "q16", text: "The church has a practical CE plan for serving its community", type: "checkbox" },
                        ]
                    },
                ]
            }
        ],
    },
    {
        "id": "assessment_002",
        "type": "PMP",
        "title": "Pastoral Ministry Profile (PMP)",
        "description": "Take a deeper look into your ministry",
        "status": "Not Started",
        "dueDate": "25 Oct 2025",
        "guidelines": [
            "Please complete the assessment in a single session without saving progress in between.",
            "It is recommended that you begin the assessment at a time when you will not be interrupted.",
            "Once the assessment begins, you will not be able to return to previous sections.",
            "This assessment consists of 5 sections to complete.",
            "The full assessment should take approximately 45 minutes."
        ],
        "sections": [
            {
                "title": "Personal Well-Being (Biopsychosocial/Spiritual filter)",
                "subtitle": "Select the option that most accurately reflects how you feel and offer you gain a deeper understanding of yourself. The more honest you are, the more helpful and guiding the outcome will be.",
                "questionGroups": [
                    {
                        "id": "group_1",
                        "questions": [
                            {
                                "id": "q_1_1",
                                "text": "Feeling physically drained most of the time.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_2",
                                "text": "Often feeling drained.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_3",
                                "text": "Feeling mostly energized and engaged.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_4",
                                "text": "Feeling fully energized and enjoying life.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_5",
                                "text": "Not physically active.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_6",
                                "text": "Occasionally exercising.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_7",
                                "text": "In the process of adopting an exercise plan.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_8",
                                "text": "Committed to an exercise plan.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_9",
                                "text": "Constant perception of stress/anxiety.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_10",
                                "text": "Thinking about getting professional help to cope with stress and anxiety (doctor(s), counselor(s), etc.).",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_11",
                                "text": "Working with a mental health professional.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_12",
                                "text": "Demonstrating a high EI - have a consistent routine for maintaining strong mental health.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_2",
                        "questions": [
                            {
                                "id": "q_2_1",
                                "text": "Significant marital/parental challenges.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_2",
                                "text": "Experiencing relational family challenges.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_3",
                                "text": "Actively engaged in the family life, prioritizing professional responsibility and personal growth.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_3",
                        "questions": [
                            {
                                "id": "q_3_1",
                                "text": "Feeling lost of self-identity.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_2",
                                "text": "A vague sense of self-identity, rely on others for personal and professional affirmation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_3",
                                "text": "Have a plan and an accountability partner(s) for personal and professional growth.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_4",
                                "text": "Provide spiritual guidance and coaching to colleagues.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4",
                        "questions": [
                            {
                                "id": "q_4_1",
                                "text": "Struggling with keeping the faith.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_2",
                                "text": "Not sensing a strong connection with God.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_3",
                                "text": "Live in a structured spiritual-life rhythm.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_4",
                                "text": "Incorporates faith in all aspects of personal and professional life.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_5",
                        "questions": [
                            {
                                "id": "q_5_1",
                                "text": "Struggling with addiction(s).",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_2",
                                "text": "Have identified a number of obstacles.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_3",
                                "text": "Have experienced success with growth and professional success.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_4",
                                "text": "Regularly receive professional/expert guidance regarding personal well-being.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_5",
                                "text": "Have experienced positive transformation and committed to continued improvement.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_6",
                        "questions": [
                            {
                                "id": "q_6_1",
                                "text": "Lack of sleep.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_6_2",
                                "text": "Limited supporting relationships.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_6_3",
                                "text": "No plan for self-care.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Professional Development/Leadership Style",
                "subtitle": "Select the option that most accurately reflects your personal and professional growth, as this self-assessment will provide the best support and guidance we can offer.",
                "questionGroups": [
                    {
                        "id": "group_2_1",
                        "questions": [
                            {
                                "id": "q_2_1_1",
                                "text": "Lost a sense of call to pastoral ministry - considering other careers.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_2",
                                "text": "Not sure if serving in faith community that 'fits' - mostly feeling connected with the assigned congregation and its leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_3",
                                "text": "Finds joy working with the church and local community leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_4",
                                "text": "Experienced lead-out doing much ministry with a sense of ministry - reading/showing up at work-visiting church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_5",
                                "text": "Performing only required tasks without any enthusiasm.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_6",
                                "text": "Excited to offer a personal skillset and expertise, service, in the church in area of CE.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_7",
                                "text": "Regularly provides CE guidance and outside of the congregation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_8",
                                "text": "Feeling cynical, distrusting self and others.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_9",
                                "text": "Not trusting local church leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_10",
                                "text": "Working confidently with the local church leaders and finding it mutually rewarding.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_11",
                                "text": "Raising the next generation of church leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_12",
                                "text": "Not sure of personal strengths and area of growth.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_13",
                                "text": "Seeking mentorship to identify and to address areas of growth.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_14",
                                "text": "Having a strong accountability and support skills.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_15",
                                "text": "Not reflecting on personal strengths, weaknesses, areas and threats.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_16",
                                "text": "Disconnected from other non-denominational entities.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_17",
                                "text": "Sporadic relationships with some CE players outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_18",
                                "text": "Have strong personal connections with many CE players in the community.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_19",
                                "text": "Play a vital leadership role in the community outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_20",
                                "text": "Very limited personal interactions with church leaders/members.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_21",
                                "text": "Not working closely with the local denominational leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_22",
                                "text": "Collaborating regularly with the local conference.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_23",
                                "text": "Have a leadership role (formal or informal) at the local conference.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Community Engagement/CE Experience",
                "subtitle": "Select the option that most accurately reflects your engagement within the community, as this assessment is designed to enhance your community engagement. The more precise you are, the better support and guidance we can offer.",
                "questionGroups": [
                    {
                        "id": "group_3_1",
                        "questions": [
                            {
                                "id": "q_3_1_1",
                                "text": "Unfamiliar with the CMA ministry concept.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_2",
                                "text": "Not fully understanding but approaching the CMA method in relationship and evangelism.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_3",
                                "text": "Fully embraces the CMA approach to ministry and evangelism.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_4",
                                "text": "Fully implements the CMA approach in all areas of life - inside and outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_5",
                                "text": "No collaborations with outside community players.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_6",
                                "text": "Some relationships with local community influencers and players.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_7",
                                "text": "Actively participating in the community life outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_8",
                                "text": "Hold a leadership role in the community life outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_9",
                                "text": "Occasional participation but no strategic leadership in CE initiatives.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_10",
                                "text": "Formal support but not active strategic leadership in the church CE efforts.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_11",
                                "text": "Prominent leadership role in CE ministries at home congregation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_12",
                                "text": "Conduct formal training classes/workshops in the area of CE for other ministry leaders.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Congregational Health",
                "subtitle": "Select the option that most accurately reflects the health of the congregation you provide with a clearer understanding of the better support and guidance we can offer you are.",
                "questionGroups": [
                    {
                        "id": "group_4_1",
                        "questions": [
                            {
                                "id": "q_4_1_1",
                                "text": "Membership/attendance is in decline.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_1_2",
                                "text": "Plateauing or declining membership.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_1_3",
                                "text": "Church membership and attendance are on the rise.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_1_4",
                                "text": "Increasing volunteer participation in CE projects—successfully implements the CMA approach in all aspects of church life.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_2",
                        "questions": [
                            {
                                "id": "q_4_2_1",
                                "text": "No clear vision and mission statements.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_2_2",
                                "text": "Vague sense of vision and mission.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_2_3",
                                "text": "Committed to strong vision and mission statements.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_2_4",
                                "text": "Compellingly embodies the church’s vision and mission statements.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_3",
                        "questions": [
                            {
                                "id": "q_4_3_1",
                                "text": "The average age of the church is above 60.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_3_2",
                                "text": "Experiencing congregational aging.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_3_3",
                                "text": "Has shown signs of healthy growth and CE ministry sustainability.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_3_4",
                                "text": "Growing younger as a congregation.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_4",
                        "questions": [
                            {
                                "id": "q_4_4_1",
                                "text": "Many toxic members.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_4_2",
                                "text": "Often dealing with unnecessary judgment, comments and rumors.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_4_3",
                                "text": "Fosters open and trusting social atmosphere—celebrating achievements and encouraging advancements.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_4_4",
                                "text": "Pursuing inward and outward holistic model of transformation as the primary focus of evangelism.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_5",
                        "questions": [
                            {
                                "id": "q_4_5_1",
                                "text": "Absence of CE leaders/volunteers.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_5_2",
                                "text": "An example of the 10/70 rule of active participation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_5_3",
                                "text": "High level of community engagement among the members.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_5_4",
                                "text": "Inspires and leads other congregations and community-transformation initiatives and projects.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_6",
                        "questions": [
                            {
                                "id": "q_4_6_1",
                                "text": "Dysfunctional church board; church leaders often talk about each other as 'us' and 'them'.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_6_2",
                                "text": "Lack of adequate representation in the church leadership.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_6_3",
                                "text": "The leadership team is trusted and adequately represents the congregation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_6_4",
                                "text": "Shows deep care for its leaders.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_7",
                        "questions": [
                            {
                                "id": "q_4_7_1",
                                "text": "Church presence not impactful in the surrounding area.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_7_2",
                                "text": "CE is focused mostly distribution goods and services and transformation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_7_3",
                                "text": "Clear signs of positive transformation in the community of CE leadership.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_7_4",
                                "text": "Increasing number of people in the surrounding community whose quality of life has been significantly improved.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_8",
                        "questions": [
                            {
                                "id": "q_4_8_1",
                                "text": "The CMA is not embodied in the life of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_8_2",
                                "text": "Occasional community-oriented events.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_8_3",
                                "text": "Members practice the CMA principles—all CE of the church is building relationships outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_8_4",
                                "text": "Recognition among and strong personal relationships with community stakeholders.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Continuing Education",
                "subtitle": "Select the option that best reflects your educational growth as this assessment is designed to provide you with a clearer understanding of your educational opportunities. The more honest you are, the better support and guidance we can offer.",
                "questionGroups": [
                    {
                        "id": "group_5_1",
                        "questions": [
                            {
                                "id": "q_5_1_1",
                                "text": "No formal community engagement/services training certification.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_1_2",
                                "text": "Some community engagement/services training certification.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_1_3",
                                "text": "Completed formal training/certification in the area of CE.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_1_4",
                                "text": "Teaches and supports others in the area of CE.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_5_2",
                        "questions": [
                            {
                                "id": "q_5_2_1",
                                "text": "Master’s degree in a ministry-related field.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_2_2",
                                "text": "Has fulfilled all educational requirements for pastoral ordination.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_2_3",
                                "text": "Holding/finishing an advanced graduate degree relevant to ministry.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_2_4",
                                "text": "Has a learning plan for post-graduate educational development.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_5_3",
                        "questions": [
                            {
                                "id": "q_5_3_1",
                                "text": "No current continuing education enrollment.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_3_2",
                                "text": "Additional formal education in a field relevant to community engagement.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_3_3",
                                "text": "Continuing formal/self-education in the field of CE.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_3_4",
                                "text": "Diverse cultural awareness and language skills.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_5_4",
                        "questions": [
                            {
                                "id": "q_5_4_1",
                                "text": "Limited cultural/language proficiency.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_4_2",
                                "text": "Thinking about pursuing another educational goal (another degree or doctorate studies).",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_4_3",
                                "text": "Developing personal cultural awareness or expanding linguistic skill through formal/self-organized educational plan.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_4_4",
                                "text": "Teaches and mentors others in the areas of self-anthropology and culture change.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "assessment_003",
        "type": "PMP",
        "title": "Pastoral Ministry Profile (PMP)",
        "description": "Take a deeper look into your ministry",
        "status": "Submitted",
        
        "completionDate": "2024-09-20",
        "completedOn": "2024-09-18",
        "meetingDate": "2025-01-20",
        "guidelines": [
            "Please complete the assessment in a single session without saving progress in between.",
            "It is recommended that you begin the assessment at a time when you will not be interrupted.",
            "Once the assessment begins, you will not be able to return to previous sections.",
            "This assessment consists of 5 sections to complete.",
            "The full assessment should take approximately 45 minutes."
        ],
        "sections": [
            {
                "title": "Personal Well-Being (Biopsychosocial/Spiritual filter)",
                "subtitle": "Select the option that most accurately reflects how you feel and offer you gain a deeper understanding of yourself. The more honest you are, the more helpful and guiding the outcome will be.",
                "questionGroups": [
                    {
                        "id": "group_1",
                        "questions": [
                            {
                                "id": "q_1_1",
                                "text": "Feeling physically drained most of the time.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_2",
                                "text": "Often feeling drained.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_3",
                                "text": "Feeling mostly energized and engaged.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_4",
                                "text": "Feeling fully energized and enjoying life.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_5",
                                "text": "Not physically active.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_6",
                                "text": "Occasionally exercising.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_7",
                                "text": "In the process of adopting an exercise plan.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_8",
                                "text": "Committed to an exercise plan.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_9",
                                "text": "Constant perception of stress/anxiety.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_10",
                                "text": "Thinking about getting professional help to cope with stress and anxiety (doctor(s), counselor(s), etc.).",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_11",
                                "text": "Working with a mental health professional.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_12",
                                "text": "Demonstrating a high EI - have a consistent routine for maintaining strong mental health.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_2",
                        "questions": [
                            {
                                "id": "q_2_1",
                                "text": "Significant marital/parental challenges.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_2",
                                "text": "Experiencing relational family challenges.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_3",
                                "text": "Actively engaged in the family life, prioritizing professional responsibility and personal growth.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_3",
                        "questions": [
                            {
                                "id": "q_3_1",
                                "text": "Feeling lost of self-identity.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_2",
                                "text": "A vague sense of self-identity, rely on others for personal and professional affirmation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_3",
                                "text": "Have a plan and an accountability partner(s) for personal and professional growth.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_4",
                                "text": "Provide spiritual guidance and coaching to colleagues.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4",
                        "questions": [
                            {
                                "id": "q_4_1",
                                "text": "Struggling with keeping the faith.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_2",
                                "text": "Not sensing a strong connection with God.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_3",
                                "text": "Live in a structured spiritual-life rhythm.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_4",
                                "text": "Incorporates faith in all aspects of personal and professional life.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_5",
                        "questions": [
                            {
                                "id": "q_5_1",
                                "text": "Struggling with addiction(s).",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_2",
                                "text": "Have identified a number of obstacles.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_3",
                                "text": "Have experienced success with growth and professional success.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_4",
                                "text": "Regularly receive professional/expert guidance regarding personal well-being.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_5",
                                "text": "Have experienced positive transformation and committed to continued improvement.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_6",
                        "questions": [
                            {
                                "id": "q_6_1",
                                "text": "Lack of sleep.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_6_2",
                                "text": "Limited supporting relationships.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_6_3",
                                "text": "No plan for self-care.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Professional Development/Leadership Style",
                "subtitle": "Select the option that most accurately reflects your personal and professional growth, as this self-assessment will provide the best support and guidance we can offer.",
                "questionGroups": [
                    {
                        "id": "group_2_1",
                        "questions": [
                            {
                                "id": "q_2_1_1",
                                "text": "Lost a sense of call to pastoral ministry - considering other careers.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_2",
                                "text": "Not sure if serving in faith community that 'fits' - mostly feeling connected with the assigned congregation and its leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_3",
                                "text": "Finds joy working with the church and local community leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_4",
                                "text": "Experienced lead-out doing much ministry with a sense of ministry - reading/showing up at work-visiting church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_5",
                                "text": "Performing only required tasks without any enthusiasm.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_6",
                                "text": "Excited to offer a personal skillset and expertise, service, in the church in area of CE.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_7",
                                "text": "Regularly provides CE guidance and outside of the congregation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_8",
                                "text": "Feeling cynical, distrusting self and others.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_9",
                                "text": "Not trusting local church leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_10",
                                "text": "Working confidently with the local church leaders and finding it mutually rewarding.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_11",
                                "text": "Raising the next generation of church leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_12",
                                "text": "Not sure of personal strengths and area of growth.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_13",
                                "text": "Seeking mentorship to identify and to address areas of growth.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_14",
                                "text": "Having a strong accountability and support skills.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_15",
                                "text": "Not reflecting on personal strengths, weaknesses, areas and threats.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_16",
                                "text": "Disconnected from other non-denominational entities.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_17",
                                "text": "Sporadic relationships with some CE players outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_18",
                                "text": "Have strong personal connections with many CE players in the community.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_19",
                                "text": "Play a vital leadership role in the community outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_20",
                                "text": "Very limited personal interactions with church leaders/members.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_21",
                                "text": "Not working closely with the local denominational leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_22",
                                "text": "Collaborating regularly with the local conference.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_23",
                                "text": "Have a leadership role (formal or informal) at the local conference.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Community Engagement/CE Experience",
                "subtitle": "Select the option that most accurately reflects your engagement within the community, as this assessment is designed to enhance your community engagement. The more precise you are, the better support and guidance we can offer.",
                "questionGroups": [
                    {
                        "id": "group_3_1",
                        "questions": [
                            {
                                "id": "q_3_1_1",
                                "text": "Unfamiliar with the CMA ministry concept.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_2",
                                "text": "Not fully understanding but approaching the CMA method in relationship and evangelism.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_3",
                                "text": "Fully embraces the CMA approach to ministry and evangelism.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_4",
                                "text": "Fully implements the CMA approach in all areas of life - inside and outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_5",
                                "text": "No collaborations with outside community players.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_6",
                                "text": "Some relationships with local community influencers and players.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_7",
                                "text": "Actively participating in the community life outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_8",
                                "text": "Hold a leadership role in the community life outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_9",
                                "text": "Occasional participation but no strategic leadership in CE initiatives.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_10",
                                "text": "Formal support but not active strategic leadership in the church CE efforts.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_11",
                                "text": "Prominent leadership role in CE ministries at home congregation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_12",
                                "text": "Conduct formal training classes/workshops in the area of CE for other ministry leaders.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Congregational Health",
                "subtitle": "Select the option that most accurately reflects the health of the congregation you provide with a clearer understanding of the better support and guidance we can offer you are.",
                "questionGroups": [
                    {
                        "id": "group_4_1",
                        "questions": [
                            {
                                "id": "q_4_1_1",
                                "text": "Membership/attendance is in decline.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_1_2",
                                "text": "Plateauing or declining membership.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_1_3",
                                "text": "Church membership and attendance are on the rise.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_1_4",
                                "text": "Increasing volunteer participation in CE projects—successfully implements the CMA approach in all aspects of church life.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_2",
                        "questions": [
                            {
                                "id": "q_4_2_1",
                                "text": "No clear vision and mission statements.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_2_2",
                                "text": "Vague sense of vision and mission.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_2_3",
                                "text": "Committed to strong vision and mission statements.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_2_4",
                                "text": "Compellingly embodies the church’s vision and mission statements.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_3",
                        "questions": [
                            {
                                "id": "q_4_3_1",
                                "text": "The average age of the church is above 60.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_3_2",
                                "text": "Experiencing congregational aging.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_3_3",
                                "text": "Has shown signs of healthy growth and CE ministry sustainability.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_3_4",
                                "text": "Growing younger as a congregation.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_4",
                        "questions": [
                            {
                                "id": "q_4_4_1",
                                "text": "Many toxic members.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_4_2",
                                "text": "Often dealing with unnecessary judgment, comments and rumors.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_4_3",
                                "text": "Fosters open and trusting social atmosphere—celebrating achievements and encouraging advancements.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_4_4",
                                "text": "Pursuing inward and outward holistic model of transformation as the primary focus of evangelism.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_5",
                        "questions": [
                            {
                                "id": "q_4_5_1",
                                "text": "Absence of CE leaders/volunteers.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_5_2",
                                "text": "An example of the 10/70 rule of active participation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_5_3",
                                "text": "High level of community engagement among the members.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_5_4",
                                "text": "Inspires and leads other congregations and community-transformation initiatives and projects.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_6",
                        "questions": [
                            {
                                "id": "q_4_6_1",
                                "text": "Dysfunctional church board; church leaders often talk about each other as 'us' and 'them'.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_6_2",
                                "text": "Lack of adequate representation in the church leadership.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_6_3",
                                "text": "The leadership team is trusted and adequately represents the congregation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_6_4",
                                "text": "Shows deep care for its leaders.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_7",
                        "questions": [
                            {
                                "id": "q_4_7_1",
                                "text": "Church presence not impactful in the surrounding area.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_7_2",
                                "text": "CE is focused mostly distribution goods and services and transformation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_7_3",
                                "text": "Clear signs of positive transformation in the community of CE leadership.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_7_4",
                                "text": "Increasing number of people in the surrounding community whose quality of life has been significantly improved.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_8",
                        "questions": [
                            {
                                "id": "q_4_8_1",
                                "text": "The CMA is not embodied in the life of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_8_2",
                                "text": "Occasional community-oriented events.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_8_3",
                                "text": "Members practice the CMA principles—all CE of the church is building relationships outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_8_4",
                                "text": "Recognition among and strong personal relationships with community stakeholders.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Continuing Education",
                "subtitle": "Select the option that best reflects your educational growth as this assessment is designed to provide you with a clearer understanding of your educational opportunities. The more honest you are, the better support and guidance we can offer.",
                "questionGroups": [
                    {
                        "id": "group_5_1",
                        "questions": [
                            {
                                "id": "q_5_1_1",
                                "text": "No formal community engagement/services training certification.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_1_2",
                                "text": "Some community engagement/services training certification.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_1_3",
                                "text": "Completed formal training/certification in the area of CE.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_1_4",
                                "text": "Teaches and supports others in the area of CE.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_5_2",
                        "questions": [
                            {
                                "id": "q_5_2_1",
                                "text": "Master’s degree in a ministry-related field.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_2_2",
                                "text": "Has fulfilled all educational requirements for pastoral ordination.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_2_3",
                                "text": "Holding/finishing an advanced graduate degree relevant to ministry.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_2_4",
                                "text": "Has a learning plan for post-graduate educational development.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_5_3",
                        "questions": [
                            {
                                "id": "q_5_3_1",
                                "text": "No current continuing education enrollment.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_3_2",
                                "text": "Additional formal education in a field relevant to community engagement.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_3_3",
                                "text": "Continuing formal/self-education in the field of CE.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_3_4",
                                "text": "Diverse cultural awareness and language skills.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_5_4",
                        "questions": [
                            {
                                "id": "q_5_4_1",
                                "text": "Limited cultural/language proficiency.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_4_2",
                                "text": "Thinking about pursuing another educational goal (another degree or doctorate studies).",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_4_3",
                                "text": "Developing personal cultural awareness or expanding linguistic skill through formal/self-organized educational plan.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_4_4",
                                "text": "Teaches and mentors others in the areas of self-anthropology and culture change.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "assessment_004",
        "type": "PMP",
        "title": "Pastoral Ministry Profile (PMP)",
        "description": "Take a deeper look into your ministry",
        "status": "Completed",
        
        "completionDate": "2024-09-20",
        "completedOn": "2024-09-18",
        "meetingDate": "2025-01-20",
        "guidelines": [
            "Please complete the assessment in a single session without saving progress in between.",
            "It is recommended that you begin the assessment at a time when you will not be interrupted.",
            "Once the assessment begins, you will not be able to return to previous sections.",
            "This assessment consists of 5 sections to complete.",
            "The full assessment should take approximately 45 minutes."
        ],
        "sections": [
            {
                "title": "Personal Well-Being (Biopsychosocial/Spiritual filter)",
                "subtitle": "Select the option that most accurately reflects how you feel and offer you gain a deeper understanding of yourself. The more honest you are, the more helpful and guiding the outcome will be.",
                "questionGroups": [
                    {
                        "id": "group_1",
                        "questions": [
                            {
                                "id": "q_1_1",
                                "text": "Feeling physically drained most of the time.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_2",
                                "text": "Often feeling drained.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_3",
                                "text": "Feeling mostly energized and engaged.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_4",
                                "text": "Feeling fully energized and enjoying life.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_5",
                                "text": "Not physically active.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_6",
                                "text": "Occasionally exercising.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_7",
                                "text": "In the process of adopting an exercise plan.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_8",
                                "text": "Committed to an exercise plan.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_9",
                                "text": "Constant perception of stress/anxiety.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_10",
                                "text": "Thinking about getting professional help to cope with stress and anxiety (doctor(s), counselor(s), etc.).",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_11",
                                "text": "Working with a mental health professional.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_1_12",
                                "text": "Demonstrating a high EI - have a consistent routine for maintaining strong mental health.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_2",
                        "questions": [
                            {
                                "id": "q_2_1",
                                "text": "Significant marital/parental challenges.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_2",
                                "text": "Experiencing relational family challenges.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_3",
                                "text": "Actively engaged in the family life, prioritizing professional responsibility and personal growth.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_3",
                        "questions": [
                            {
                                "id": "q_3_1",
                                "text": "Feeling lost of self-identity.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_2",
                                "text": "A vague sense of self-identity, rely on others for personal and professional affirmation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_3",
                                "text": "Have a plan and an accountability partner(s) for personal and professional growth.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_4",
                                "text": "Provide spiritual guidance and coaching to colleagues.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4",
                        "questions": [
                            {
                                "id": "q_4_1",
                                "text": "Struggling with keeping the faith.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_2",
                                "text": "Not sensing a strong connection with God.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_3",
                                "text": "Live in a structured spiritual-life rhythm.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_4",
                                "text": "Incorporates faith in all aspects of personal and professional life.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_5",
                        "questions": [
                            {
                                "id": "q_5_1",
                                "text": "Struggling with addiction(s).",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_2",
                                "text": "Have identified a number of obstacles.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_3",
                                "text": "Have experienced success with growth and professional success.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_4",
                                "text": "Regularly receive professional/expert guidance regarding personal well-being.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_5",
                                "text": "Have experienced positive transformation and committed to continued improvement.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_6",
                        "questions": [
                            {
                                "id": "q_6_1",
                                "text": "Lack of sleep.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_6_2",
                                "text": "Limited supporting relationships.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_6_3",
                                "text": "No plan for self-care.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Professional Development/Leadership Style",
                "subtitle": "Select the option that most accurately reflects your personal and professional growth, as this self-assessment will provide the best support and guidance we can offer.",
                "questionGroups": [
                    {
                        "id": "group_2_1",
                        "questions": [
                            {
                                "id": "q_2_1_1",
                                "text": "Lost a sense of call to pastoral ministry - considering other careers.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_2",
                                "text": "Not sure if serving in faith community that 'fits' - mostly feeling connected with the assigned congregation and its leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_3",
                                "text": "Finds joy working with the church and local community leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_4",
                                "text": "Experienced lead-out doing much ministry with a sense of ministry - reading/showing up at work-visiting church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_5",
                                "text": "Performing only required tasks without any enthusiasm.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_6",
                                "text": "Excited to offer a personal skillset and expertise, service, in the church in area of CE.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_7",
                                "text": "Regularly provides CE guidance and outside of the congregation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_8",
                                "text": "Feeling cynical, distrusting self and others.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_9",
                                "text": "Not trusting local church leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_10",
                                "text": "Working confidently with the local church leaders and finding it mutually rewarding.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_11",
                                "text": "Raising the next generation of church leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_12",
                                "text": "Not sure of personal strengths and area of growth.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_13",
                                "text": "Seeking mentorship to identify and to address areas of growth.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_14",
                                "text": "Having a strong accountability and support skills.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_15",
                                "text": "Not reflecting on personal strengths, weaknesses, areas and threats.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_16",
                                "text": "Disconnected from other non-denominational entities.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_17",
                                "text": "Sporadic relationships with some CE players outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_18",
                                "text": "Have strong personal connections with many CE players in the community.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_19",
                                "text": "Play a vital leadership role in the community outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_20",
                                "text": "Very limited personal interactions with church leaders/members.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_21",
                                "text": "Not working closely with the local denominational leaders.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_22",
                                "text": "Collaborating regularly with the local conference.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_2_1_23",
                                "text": "Have a leadership role (formal or informal) at the local conference.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Community Engagement/CE Experience",
                "subtitle": "Select the option that most accurately reflects your engagement within the community, as this assessment is designed to enhance your community engagement. The more precise you are, the better support and guidance we can offer.",
                "questionGroups": [
                    {
                        "id": "group_3_1",
                        "questions": [
                            {
                                "id": "q_3_1_1",
                                "text": "Unfamiliar with the CMA ministry concept.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_2",
                                "text": "Not fully understanding but approaching the CMA method in relationship and evangelism.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_3",
                                "text": "Fully embraces the CMA approach to ministry and evangelism.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_4",
                                "text": "Fully implements the CMA approach in all areas of life - inside and outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_5",
                                "text": "No collaborations with outside community players.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_6",
                                "text": "Some relationships with local community influencers and players.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_7",
                                "text": "Actively participating in the community life outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_8",
                                "text": "Hold a leadership role in the community life outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_9",
                                "text": "Occasional participation but no strategic leadership in CE initiatives.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_10",
                                "text": "Formal support but not active strategic leadership in the church CE efforts.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_11",
                                "text": "Prominent leadership role in CE ministries at home congregation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_3_1_12",
                                "text": "Conduct formal training classes/workshops in the area of CE for other ministry leaders.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Congregational Health",
                "subtitle": "Select the option that most accurately reflects the health of the congregation you provide with a clearer understanding of the better support and guidance we can offer you are.",
                "questionGroups": [
                    {
                        "id": "group_4_1",
                        "questions": [
                            {
                                "id": "q_4_1_1",
                                "text": "Membership/attendance is in decline.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_1_2",
                                "text": "Plateauing or declining membership.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_1_3",
                                "text": "Church membership and attendance are on the rise.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_1_4",
                                "text": "Increasing volunteer participation in CE projects—successfully implements the CMA approach in all aspects of church life.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_2",
                        "questions": [
                            {
                                "id": "q_4_2_1",
                                "text": "No clear vision and mission statements.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_2_2",
                                "text": "Vague sense of vision and mission.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_2_3",
                                "text": "Committed to strong vision and mission statements.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_2_4",
                                "text": "Compellingly embodies the church’s vision and mission statements.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_3",
                        "questions": [
                            {
                                "id": "q_4_3_1",
                                "text": "The average age of the church is above 60.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_3_2",
                                "text": "Experiencing congregational aging.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_3_3",
                                "text": "Has shown signs of healthy growth and CE ministry sustainability.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_3_4",
                                "text": "Growing younger as a congregation.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_4",
                        "questions": [
                            {
                                "id": "q_4_4_1",
                                "text": "Many toxic members.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_4_2",
                                "text": "Often dealing with unnecessary judgment, comments and rumors.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_4_3",
                                "text": "Fosters open and trusting social atmosphere—celebrating achievements and encouraging advancements.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_4_4",
                                "text": "Pursuing inward and outward holistic model of transformation as the primary focus of evangelism.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_5",
                        "questions": [
                            {
                                "id": "q_4_5_1",
                                "text": "Absence of CE leaders/volunteers.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_5_2",
                                "text": "An example of the 10/70 rule of active participation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_5_3",
                                "text": "High level of community engagement among the members.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_5_4",
                                "text": "Inspires and leads other congregations and community-transformation initiatives and projects.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_6",
                        "questions": [
                            {
                                "id": "q_4_6_1",
                                "text": "Dysfunctional church board; church leaders often talk about each other as 'us' and 'them'.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_6_2",
                                "text": "Lack of adequate representation in the church leadership.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_6_3",
                                "text": "The leadership team is trusted and adequately represents the congregation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_6_4",
                                "text": "Shows deep care for its leaders.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_7",
                        "questions": [
                            {
                                "id": "q_4_7_1",
                                "text": "Church presence not impactful in the surrounding area.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_7_2",
                                "text": "CE is focused mostly distribution goods and services and transformation.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_7_3",
                                "text": "Clear signs of positive transformation in the community of CE leadership.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_7_4",
                                "text": "Increasing number of people in the surrounding community whose quality of life has been significantly improved.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_4_8",
                        "questions": [
                            {
                                "id": "q_4_8_1",
                                "text": "The CMA is not embodied in the life of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_8_2",
                                "text": "Occasional community-oriented events.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_8_3",
                                "text": "Members practice the CMA principles—all CE of the church is building relationships outside of the church.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_4_8_4",
                                "text": "Recognition among and strong personal relationships with community stakeholders.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Continuing Education",
                "subtitle": "Select the option that best reflects your educational growth as this assessment is designed to provide you with a clearer understanding of your educational opportunities. The more honest you are, the better support and guidance we can offer.",
                "questionGroups": [
                    {
                        "id": "group_5_1",
                        "questions": [
                            {
                                "id": "q_5_1_1",
                                "text": "No formal community engagement/services training certification.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_1_2",
                                "text": "Some community engagement/services training certification.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_1_3",
                                "text": "Completed formal training/certification in the area of CE.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_1_4",
                                "text": "Teaches and supports others in the area of CE.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_5_2",
                        "questions": [
                            {
                                "id": "q_5_2_1",
                                "text": "Master’s degree in a ministry-related field.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_2_2",
                                "text": "Has fulfilled all educational requirements for pastoral ordination.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_2_3",
                                "text": "Holding/finishing an advanced graduate degree relevant to ministry.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_2_4",
                                "text": "Has a learning plan for post-graduate educational development.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_5_3",
                        "questions": [
                            {
                                "id": "q_5_3_1",
                                "text": "No current continuing education enrollment.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_3_2",
                                "text": "Additional formal education in a field relevant to community engagement.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_3_3",
                                "text": "Continuing formal/self-education in the field of CE.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_3_4",
                                "text": "Diverse cultural awareness and language skills.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "group_5_4",
                        "questions": [
                            {
                                "id": "q_5_4_1",
                                "text": "Limited cultural/language proficiency.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_4_2",
                                "text": "Thinking about pursuing another educational goal (another degree or doctorate studies).",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_4_3",
                                "text": "Developing personal cultural awareness or expanding linguistic skill through formal/self-organized educational plan.",
                                "type": "checkbox",
                                "required": true
                            },
                            {
                                "id": "q_5_4_4",
                                "text": "Teaches and mentors others in the areas of self-anthropology and culture change.",
                                "type": "checkbox",
                                "required": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
];