// Trial Round Question Bank — 20 mixed questions (riddles, BODMAS, logic)
// type: "mcq" = multiple choice, "text" = fill-in-the-blank (admin-reviewed)

const trialQuestions = [
    // Q1 — BODMAS trick (MCQ)
    {
        id: "q1",
        type: "mcq",
        question: "What is 8 ÷ 2(2+2)?",
        options: ["1", "8", "16", "32"],
        correctAnswer: 2
    },

    // Q2 — Riddle (Text — admin reviewed)
    {
        id: "q2",
        type: "text",
        question: "In a pitch-dark room, four capsules lie on a table.\nTwo are red. Two are blue.\n\nYou cannot see their colors.\n\nTo survive, you must consume exactly one red and one blue.\nIf you consume two of the same color, you die.\n\nObjective:\nFind a method that guarantees survival.",
        correctAnswer: null // Admin will judge
    },

    // Q3 — BODMAS trick (MCQ)
    {
        id: "q3",
        type: "mcq",
        question: "What is 6 ÷ 2(1+2)?",
        options: ["1", "3", "6", "9"],
        correctAnswer: 3
    },

    // Q4 — Riddle (Text — admin reviewed)
    {
        id: "q4",
        type: "text",
        question: "In the basement of a building, there are three switches.\n\nUpstairs, in a sealed room, there is one bulb.\n\nThe staircase locks once you go up.\nYou cannot return downstairs.\n\nYou may interact with the switches before going up.\nAfter you see the bulb, the round ends.\n\nObjective:\nDetermine which switch controls the bulb.",
        correctAnswer: null
    },

    // Q5 — BODMAS trick (MCQ)
    {
        id: "q5",
        type: "mcq",
        question: "What is 60 ÷ 5(7−5)?",
        options: ["6", "12", "24", "120"],
        correctAnswer: 2
    },

    // Q6 — Logic riddle (Text — admin reviewed)
    {
        id: "q6",
        type: "text",
        question: "A man is found dead in a locked room. There is a puddle of water beneath him. He is hanging from the ceiling.\n\nThere is nothing else in the room — no furniture, no rope attached to anything.\n\nHow did he die?",
        correctAnswer: null
    },

    // Q7 — BODMAS trick (MCQ)
    {
        id: "q7",
        type: "mcq",
        question: "What is 3 + 3 × 3 − 3 + 3?",
        options: ["12", "15", "18", "21"],
        correctAnswer: 0
    },

    // Q8 — Logic riddle (Text — admin reviewed)
    {
        id: "q8",
        type: "text",
        question: "You are in a room with two doors. One leads to freedom, one leads to death.\n\nTwo guards stand before you. One always tells the truth. One always lies. You don't know which is which.\n\nYou may ask ONE question to ONE guard.\n\nWhat question do you ask to guarantee your freedom?",
        correctAnswer: null
    },

    // Q9 — BODMAS trap (MCQ)
    {
        id: "q9",
        type: "mcq",
        question: "What is 2² + 2² × 2²?",
        options: ["12", "16", "20", "64"],
        correctAnswer: 2
    },

    // Q10 — Riddle (Text — admin reviewed)
    {
        id: "q10",
        type: "text",
        question: "100 prisoners are each assigned a number from 1 to 100. A room contains 100 boxes, each also numbered 1 to 100. Inside each box is a random prisoner's number.\n\nEach prisoner enters alone, opens at most 50 boxes, and must find their own number. They cannot communicate after entering.\n\nIf ALL prisoners find their number, they are freed. If even ONE fails, they all die.\n\nThey may strategize beforehand.\n\nWhat strategy maximizes their chance of survival?",
        correctAnswer: null
    },

    // Q11 — BODMAS trick (MCQ)
    {
        id: "q11",
        type: "mcq",
        question: "What is 48 ÷ 2(9+3)?",
        options: ["2", "4", "288", "576"],
        correctAnswer: 2
    },

    // Q12 — Trick question (MCQ)
    {
        id: "q12",
        type: "mcq",
        question: "If you have 10 apples and take away 3, how many do YOU have?",
        options: ["3", "7", "10", "0"],
        correctAnswer: 0
    },

    // Q13 — Riddle (Text — admin reviewed)
    {
        id: "q13",
        type: "text",
        question: "Five people are standing in a line. Each is wearing either a black or white hat.\n\nEach person can see all the hats IN FRONT of them, but not their own or those behind them.\n\nStarting from the BACK, each must guess their own hat color aloud.\n\nThey may strategize beforehand, but once the guessing begins, they can only say 'black' or 'white.'\n\nWhat strategy guarantees the most survivors?",
        correctAnswer: null
    },

    // Q14 — BODMAS confusing (MCQ)
    {
        id: "q14",
        type: "mcq",
        question: "What is 7 + 7 ÷ 7 + 7 × 7 − 7?",
        options: ["8", "43", "50", "56"],
        correctAnswer: 1
    },

    // Q15 — Logic trap (MCQ)
    {
        id: "q15",
        type: "mcq",
        question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
        options: ["$0.10", "$0.05", "$0.15", "$0.01"],
        correctAnswer: 1
    },

    // Q16 — Riddle (Text — admin reviewed)
    {
        id: "q16",
        type: "text",
        question: "You are on a bridge. A sniper is watching you from afar. If you walk forward, you reach the sniper. If you walk backward, a bomb explodes.\n\nYou cannot stay still — the bridge collapses in 10 minutes.\n\nThere are no sides to jump off. No tools. No phone.\n\nHow do you survive?",
        correctAnswer: null
    },

    // Q17 — BODMAS percentage trick (MCQ)
    {
        id: "q17",
        type: "mcq",
        question: "What is 25% of 200 + 50% of 100?",
        options: ["50", "75", "100", "150"],
        correctAnswer: 2
    },

    // Q18 — Riddle (Text — admin reviewed)
    {
        id: "q18",
        type: "text",
        question: "A king wants to test his three advisors. He shows them 5 hats — 3 black and 2 white — then blindfolds them and places a hat on each.\n\nHe removes the blindfolds. Each can see the other two hats but not their own.\n\nHe asks each in turn: 'Do you know your hat color?'\n\nThe first says no. The second says no.\n\nThe third one, who is BLIND, says: 'Yes, I know my hat color.'\n\nWhat color is it, and how does he know?",
        correctAnswer: null
    },

    // Q19 — BODMAS deception (MCQ)
    {
        id: "q19",
        type: "mcq",
        question: "What is 0.1 + 0.2?",
        options: ["0.3", "0.30000000000000004", "0.2", "0.12"],
        correctAnswer: 0
    },

    // Q20 — Logic riddle (Text — admin reviewed)
    {
        id: "q20",
        type: "text",
        question: "Three people check into a hotel room that costs $30. They each pay $10.\n\nLater, the manager realizes the room only costs $25, so he gives $5 to the bellboy to return.\n\nThe bellboy keeps $2 and gives $1 back to each person.\n\nNow each person has paid $9 (total $27), the bellboy has $2. That's $29.\n\nWhere is the missing dollar?",
        correctAnswer: null
    }
];

export default trialQuestions;
