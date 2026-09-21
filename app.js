const CONFIG = {
  APPS_SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycbyyEhvSmfQSPQ-v3WVSNDzLrIMPyGYet9BrGEfwM9D3B8KsXDJqTztJ4F5Vh21YGBWY6g/exec"
};

const STORAGE_KEY = "personal_progress_v1";

const goals = [
  {
    icon: "💻",
    name: "Coding / Web Development",
    target: "50 ชั่วโมง",
    type: "coding",
    targetValue: 3000
  },
  {
    icon: "⚖️",
    name: "เพิ่มน้ำหนัก",
    target: "55 กก. ระยะแรก",
    type: "weight",
    targetValue: 55
  },
  {
    icon: "🏃",
    name: "ออกกำลังกาย",
    target: "อย่างน้อย 3 วัน/สัปดาห์",
    type: "exerciseDays",
    targetValue: 3
  },
  {
    icon: "📚",
    name: "พัฒนาความคิด",
    target: "30 นาที/วัน",
    type: "mind",
    targetValue: 30
  }
];

const projects = [
  {
    name: "🗳️ ระบบโหวตประธานนักเรียน",
    desc: "ระบบโหวต + Admin Dashboard + Database",
    steps: [
      "หน้าโหวต",
      "ตรวจเลขประจำตัว",
      "ป้องกันโหวตซ้ำ",
      "Admin Login",
      "เพิ่ม / แก้ไข / ลบข้อมูล",
      "ผลโหวต Real-time"
    ]
  },
  {
    name: "📊 Personal Progress Dashboard",
    desc: "ระบบบันทึกผลการพัฒนาตัวเองรายวัน",
    steps: [
      "Daily Check-in",
      "Google Sheets",
      "Dashboard",
      "Goals",
      "Project Tracker",
      "สรุป 7 / 30 วัน"
    ]
  }
];

let data = JSON.parse(
  localStorage.getItem(STORAGE_KEY) || "[]"
);

const $ = id => document.getElementById(id);

function localDate() {
  return new Date().toLocaleDateString(
    "en-CA",
    {
      timeZone: "Asia/Bangkok"
    }
  );
}

function showTab(id) {

  document
    .querySelectorAll(".page")
    .forEach(x =>
      x.classList.remove("active")
    );

  document
    .querySelectorAll(".tab")
    .forEach(x =>
      x.classList.remove("active")
    );

  $(id).classList.add("active");

  const button =
    document.querySelector(
      `[data-tab="${id}"]`
    );

  if (button) {
    button.classList.add("active");
  }

  render();
}

document
  .querySelectorAll(".tab")
  .forEach(button => {

    button.onclick = () =>
      showTab(button.dataset.tab);

  });


function saveLocal(row) {

  const index =
    data.findIndex(
      x => x.date === row.date
    );

  if (index >= 0) {

    data[index] = row;

  } else {

    data.push(row);

  }

  data.sort(
    (a, b) =>
      a.date.localeCompare(b.date)
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}


async function saveRemote(row) {

  if (!CONFIG.APPS_SCRIPT_URL) {
    return true;
  }

  const response =
    await fetch(
      CONFIG.APPS_SCRIPT_URL,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },
        body: JSON.stringify(row)
      }
    );

  if (!response.ok) {
    throw new Error(
      "Google Sheets connection failed"
    );
  }

  return true;
}


function calculateScore(row) {

  const values = [

    Math.min(
      Number(row.coding) || 0,
      180
    ) / 180,

    Math.min(
      Number(row.mind) || 0,
      45
    ) / 45,

    Math.min(
      Number(row.english) || 0,
      30
    ) / 30,

    Math.min(
      Number(row.communication) || 0,
      20
    ) / 20,

    Math.min(
      Number(row.exercise) || 0,
      60
    ) / 60,

    Math.min(
      Number(row.sleep) || 0,
      8
    ) / 8

  ];

  return Math.round(
    values.reduce(
      (a, b) => a + b,
      0
    ) /
    values.length *
    100
  );
}


function loadToday() {

  const date =
    $("date").value ||
    localDate();

  const row =
    data.find(
      x => x.date === date
    );

  if (!row) {
    return;
  }

  [
    "coding",
    "mind",
    "english",
    "communication",
    "exercise",
    "weight",
    "sleep",
    "learning",
    "note"
  ].forEach(key => {

    if ($(key)) {
      $(key).value =
        row[key] ?? "";
    }

  });

  $("saveStatus").textContent =
    "มีข้อมูลวันนี้";

}


$("checkinForm").onsubmit =
  async function (event) {

    event.preventDefault();

    const row = {

      date: $("date").value,

      coding:
        Number($("coding").value) || 0,

      mind:
        Number($("mind").value) || 0,

      english:
        Number($("english").value) || 0,

      communication:
        Number($("communication").value) || 0,

      exercise:
        Number($("exercise").value) || 0,

      weight:
        Number($("weight").value) || 0,

      sleep:
        Number($("sleep").value) || 0,

      learning:
        $("learning").value,

      note:
        $("note").value

    };

    saveLocal(row);

    $("saveStatus").textContent =
      "กำลังบันทึก…";

    try {

      await saveRemote(row);

      $("saveStatus").textContent =
        "บันทึกแล้ว ✓";

      render();

    } catch (error) {

      console.error(error);

      $("saveStatus").textContent =
        "บันทึกในเครื่องแล้ว • Sheets ยังไม่เชื่อม";

    }

  };


function getStreak() {

  let streak = 0;

  const current =
    new Date();

  for (;;) {

    const date =
      current.toLocaleDateString(
        "en-CA",
        {
          timeZone: "Asia/Bangkok"
        }
      );

    const found =
      data.some(
        x => x.date === date
      );

    if (!found) {
      break;
    }

    streak++;

    current.setDate(
      current.getDate() - 1
    );

  }

  return streak;
}


function render() {

  const today =
    localDate();

  const todayData =
    data.find(
      x => x.date === today
    );

  const todayScore =
    todayData
      ? calculateScore(todayData)
      : 0;

  $("todayLabel").textContent =
    new Date().toLocaleDateString(
      "th-TH",
      {
        dateStyle: "full"
      }
    );

  $("streak").textContent =
    `🔥 ${getStreak()} วัน`;

  $("todayScore").textContent =
    todayScore + "%";

  $("scoreBar").style.width =
    todayScore + "%";


  $("todayHeadline").textContent =
    todayData
      ? (
          todayScore >= 80
            ? "วันนี้ทำได้ดีมาก"
            : "วันนี้มีการบันทึกแล้ว"
        )
      : "พร้อมลุยวันนี้";


  $("todaySummary").textContent =
    todayData
      ? (
          todayData.learning ||
          "บันทึกข้อมูลประจำวันเรียบร้อย"
        )
      : "ยังไม่มีข้อมูลของวันนี้";


  const codingTotal =
    data.reduce(
      (total, row) =>
        total +
        (Number(row.coding) || 0),
      0
    );


  const exerciseTotal =
    data.reduce(
      (total, row) =>
        total +
        (Number(row.exercise) || 0),
      0
    );


  $("codingTotal").textContent =
    (codingTotal / 60).toFixed(1) +
    " ชม.";


  $("exerciseTotal").textContent =
    exerciseTotal +
    " นาที";


  $("learningDays").textContent =
    data.filter(
      row => row.learning
    ).length +
    " วัน";


  const latestWeight =
    [...data]
      .filter(
        row =>
          Number(row.weight) > 0
      )
      .sort(
        (a, b) =>
          b.date.localeCompare(
            a.date
          )
      )[0];


  $("latestWeight").textContent =
    latestWeight
      ? Number(
          latestWeight.weight
        ).toFixed(2) +
        " กก."
      : "—";


  const days = [];

  for (
    let i = 6;
    i >= 0;
    i--
  ) {

    const date =
      new Date();

    date.setDate(
      date.getDate() - i
    );

    const key =
      date.toLocaleDateString(
        "en-CA",
        {
          timeZone: "Asia/Bangkok"
        }
      );

    days.push({
      key,
      row: data.find(
        x => x.date === key
      )
    });

  }


  $("weekChart").innerHTML =
    days
      .map(item => {

        const score =
          item.row
            ? calculateScore(
                item.row
              )
            : 0;

        return `
          <div class="bar-wrap">

            <div class="bar">

              <i
                style="height:${score}%">
              </i>

            </div>

            <small>
              ${item.key.slice(5)}
            </small>

          </div>
        `;

      })
      .join("");


  const weekAverage =
    Math.round(
      days.reduce(
        (total, item) =>
          total +
          (
            item.row
              ? calculateScore(
                  item.row
                )
              : 0
          ),
        0
      ) / 7
    );


  $("weekAverage").textContent =
    weekAverage + "%";


  $("todayChecklist").innerHTML =
    [

      [
        "💻 Coding",
        todayData?.coding || 0,
        "นาที"
      ],

      [
        "🧠 ความคิด",
        todayData?.mind || 0,
        "นาที"
      ],

      [
        "🇬🇧 English",
        todayData?.english || 0,
        "นาที"
      ],

      [
        "🏃 ออกกำลัง",
        todayData?.exercise || 0,
        "นาที"
      ],

      [
        "😴 นอน",
        todayData?.sleep || 0,
        "ชม."
      ]

    ]

      .map(item => {

        return `
          <div class="checkitem">

            <span>
              ${item[0]}
            </span>

            <strong>
              ${item[1]} ${item[2]}
            </strong>

          </div>
        `;

      })
      .join("");


  $("goalsGrid").innerHTML =
    goals
      .map(goal => {

        let progress = 0;

        if (
          goal.type === "coding"
        ) {

          progress =
            Math.min(
              100,
              codingTotal /
              goal.targetValue *
              100
            );

        }


        if (
          goal.type === "weight" &&
          latestWeight
        ) {

          progress =
            Math.min(
              100,
              latestWeight.weight /
              goal.targetValue *
              100
            );

        }


        if (
          goal.type ===
          "exerciseDays"
        ) {

          const count =
            data
              .slice(-7)
              .filter(
                row =>
                  Number(
                    row.exercise
                  ) >= 30
              ).length;

          progress =
            Math.min(
              100,
              count /
              goal.targetValue *
              100
            );

        }


        if (
          goal.type === "mind"
        ) {

          progress =
            Math.min(
              100,
              (
                todayData?.mind ||
                0
              ) /
              goal.targetValue *
              100
            );

        }


        return `
          <article class="goal">

            <h3>
              ${goal.icon}
              ${goal.name}
            </h3>

            <p>
              ${goal.target}
            </p>

            <div class="progress">

              <i
                style="width:${progress}%">
              </i>

            </div>

            <div class="goal-foot">

              <span>
                ความคืบหน้า
              </span>

              <strong>
                ${Math.round(progress)}%
              </strong>

            </div>

          </article>
        `;

      })
      .join("");


  $("projectsGrid").innerHTML =
    projects
      .map(project => {

        return `
          <article class="project">

            <h3>
              ${project.name}
            </h3>

            <p>
              ${project.desc}
            </p>

            <ul>

              ${project.steps
                .map(
                  step =>
                    `<li>☐ ${step}</li>`
                )
                .join("")}

            </ul>

          </article>
        `;

      })
      .join("");

}


$("date").value =
  localDate();

render();
