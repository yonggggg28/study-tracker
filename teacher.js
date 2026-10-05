// =====================================================
// 讀取與整理紀錄
// =====================================================

let firebaseRecords = [];


function getRecords() {

    return firebaseRecords;

}


// 舊紀錄可能沒有 concept。
// 利用 questionId 從新版 questions.js 找回分類。
function normalizeRecord(record) {

    if (
        record.concept &&
        record.conceptName
    ) {
        return record;
    }

    const question = questions.find(
        q => q.id === record.questionId
    );

    if (!question) {
        return record;
    }

    return {
        ...record,

        subject: question.subject,
        subjectName: question.subjectName,

        book: question.book,

        unit: question.unit,
        unitName: question.unitName,

        concept: question.concept,
        conceptName: question.conceptName,

        type: question.type,
        typeName: question.typeName
    };
}


function getNormalizedRecords() {
    return getRecords().map(normalizeRecord);
}


// =====================================================
// 所有紀錄 / 目前篩選後紀錄
// =====================================================

let allRecords = [];

// =====================================================
// 目前教師端查看的學生
// =====================================================

let selectedStudentId = null;

// =====================================================
// 建立學生選擇清單
// =====================================================

function setupStudentSelector() {

    const selector =
        document.getElementById(
            "studentFilter"
        );

    if (!selector) {
        return;
    }


    // ------------------------------------------
    // 從作答紀錄找出不同學生
    // ------------------------------------------

    const studentMap =
        new Map();


    allRecords.forEach(record => {

        if (!record.studentId) {
            return;
        }


        if (
            !studentMap.has(
                record.studentId
            )
        ) {

            studentMap.set(
                record.studentId,
                {
                    id:
                        record.studentId,

                    name:
                        record.studentName ||
                        record.studentEmail ||
                        "未命名學生"
                }
            );
        }

    });


    const students =
        Array.from(
            studentMap.values()
        );


    // ------------------------------------------
    // 妹妹排最前面
    // ------------------------------------------

    students.sort((a, b) => {

        if (a.name === "妹妹") {
            return -1;
        }

        if (b.name === "妹妹") {
            return 1;
        }

        return a.name.localeCompare(
            b.name,
            "zh-TW"
        );

    });


    // ------------------------------------------
    // 建立下拉選單
    // ------------------------------------------

    selector.innerHTML = "";


    students.forEach(student => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            student.id;

        option.textContent =
            student.name;

        selector.appendChild(
            option
        );

    });


    // ------------------------------------------
    // 預設選第一位學生
    // 妹妹已經被排在第一位
    // ------------------------------------------

    if (
        students.length > 0 &&
        !selectedStudentId
    ) {

        selectedStudentId =
            students[0].id;

        selector.value =
            selectedStudentId;
    }


    // ------------------------------------------
    // 切換學生
    // ------------------------------------------

    selector.onchange =
        function () {

            selectedStudentId =
                selector.value;

            renderDashboard();

        };

}

// =====================================================
// 從 Firebase 讀取全部作答紀錄
// =====================================================

async function loadRecordsFromFirebase() {

    try {

        const snapshot =
            await db
                .collection("studyRecords")
                .get();


        firebaseRecords =
            snapshot.docs.map(
                doc => ({
                    firebaseId: doc.id,
                    ...doc.data()
                })
            );


        // 依照作答時間排序
        firebaseRecords.sort(
            (a, b) => {

                const timeA =
                    a.time
                        ? new Date(a.time).getTime()
                        : 0;

                const timeB =
                    b.time
                        ? new Date(b.time).getTime()
                        : 0;

                return timeA - timeB;
            }
        );


        allRecords =
            firebaseRecords.map(
                normalizeRecord
            );


        console.log(
            `🔥 已從 Firebase 讀取 ${allRecords.length} 筆作答紀錄`
        );


        // 建立學生選擇器
        setupStudentSelector();


        // 顯示目前學生資料
        renderDashboard();


    } catch (error) {

        console.error(
            "🔥 Firebase 作答紀錄讀取失敗：",
            error
        );

        alert(
            "Firebase 作答紀錄讀取失敗\n\n" +
            (error.message || String(error))
        );
    }
}

function getCurrentRecords() {

    const filterElement =
        document.getElementById("timeFilter");

    const filter =
        filterElement
            ? filterElement.value
            : "latest";

    return getFilteredRecords(filter);
}

// =====================================================
// 日期工具
// =====================================================

function getLocalDateString(date) {

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// =====================================================
// 依查看範圍篩選紀錄
// =====================================================

function getFilteredRecords(filter) {

    // 先依學生篩選
    const studentRecords =
        selectedStudentId
            ? allRecords.filter(
                record =>
                    record.studentId === selectedStudentId
            )
            : [];

    // 再篩選理化資料
    const scienceRecords =
        studentRecords.filter(
            record =>
                record.subject === "science" ||
                record.subject === "理化"
        );


    if (scienceRecords.length === 0) {

        return [];
    }


    // -------------------------
    // 最近一次學習
    // 以最大的 studyDay 判斷
    // -------------------------

    if (filter === "latest") {

        const studyDays =
            scienceRecords
                .map(record =>
                    parseInt(record.studyDay)
                )
                .filter(day =>
                    !isNaN(day)
                );


        if (studyDays.length === 0) {

            return [];
        }


        const latestDay =
            Math.max(...studyDays);


        return scienceRecords.filter(
            record =>
                parseInt(record.studyDay) ===
                latestDay
        );
    }


    // -------------------------
    // 今天
    // -------------------------

    if (filter === "today") {

        const today =
            getLocalDateString(
                new Date()
            );


        return scienceRecords.filter(
            record => {

                if (!record.time) {

                    return false;
                }


                const recordDate =
                    new Date(
                        record.time
                    );


                if (
                    isNaN(
                        recordDate.getTime()
                    )
                ) {

                    return false;
                }


                return (
                    getLocalDateString(
                        recordDate
                    ) === today
                );
            }
        );
    }


    // -------------------------
    // 最近 3 天 / 7 天
    // -------------------------

    if (
        filter === "3days" ||
        filter === "7days"
    ) {

        const days =
            filter === "3days"
                ? 3
                : 7;


        const now =
            new Date();


        const start =
            new Date();


        start.setHours(
            0,
            0,
            0,
            0
        );


        start.setDate(
            start.getDate() -
            (days - 1)
        );


        return scienceRecords.filter(
            record => {

                if (!record.time) {

                    return false;
                }


                const recordDate =
                    new Date(
                        record.time
                    );


                return (
                    !isNaN(
                        recordDate.getTime()
                    ) &&
                    recordDate >= start &&
                    recordDate <= now
                );
            }
        );
    }


    // -------------------------
    // 全部紀錄
    // -------------------------

    return scienceRecords;
}


// =====================================================
// 共用工具
// =====================================================

function getStatus(rate) {

    if (rate >= 80) {
        return {
            icon: "🟢",
            text: "熟悉"
        };
    }

    if (rate >= 60) {
        return {
            icon: "🟡",
            text: "不穩"
        };
    }

    return {
        icon: "🔴",
        text: "不熟"
    };
}


function getConceptStats() {

    const records = getCurrentRecords();
    const stats = {};

    records.forEach(record => {

        if (
            record.subject !== "science" &&
            record.subject !== "理化"
        ) {
            return;
        }

        if (!record.concept) {
            return;
        }

        if (!stats[record.concept]) {

            stats[record.concept] = {

                book: record.book,

                unit: record.unit,
                unitName:
                    record.unitName ||
                    record.unit,

                concept:
                    record.concept,

                conceptName:
                    record.conceptName ||
                    record.topic ||
                    record.concept,

                total: 0,
                correct: 0,
                dontKnow: 0,

                errorReasons: {}
            };
        }


        const stat =
            stats[record.concept];

        stat.total++;


        if (record.correct) {
            stat.correct++;
        }


        if (record.dontKnow) {
            stat.dontKnow++;
        }


        if (
            !record.correct &&
            record.errorReason
        ) {

            if (
                !stat.errorReasons[
                record.errorReason
                ]
            ) {

                stat.errorReasons[
                    record.errorReason
                ] = 0;
            }

            stat.errorReasons[
                record.errorReason
            ]++;
        }
    });


    Object.values(stats)
        .forEach(stat => {

            stat.rate =
                Math.round(
                    stat.correct /
                    stat.total *
                    100
                );

            stat.status =
                getStatus(stat.rate);
        });


    return stats;
}


// =====================================================
// ① 總覽
// =====================================================

function showSummary() {

    const records =
        getCurrentRecords();

    const scienceRecords =
        records.filter(
            r =>
                r.subject === "science" ||
                r.subject === "理化"
        );


    const total =
        scienceRecords.length;


    const correct =
        scienceRecords.filter(
            r => r.correct
        ).length;


    const rate =
        total > 0
            ? Math.round(
                correct / total * 100
            )
            : 0;


    const selectedFilter =
        document.getElementById(
            "timeFilter"
        )?.value || "latest";


    let days = 0;


    if (
        selectedFilter === "latest"
    ) {

        const studyDays =
            scienceRecords
                .map(record =>
                    parseInt(
                        record.studyDay
                    )
                )
                .filter(day =>
                    !isNaN(day)
                );


        days =
            studyDays.length > 0
                ? Math.max(
                    ...studyDays
                )
                : 0;

    } else {

        days =
            new Set(
                scienceRecords
                    .map(
                        record =>
                            record.studyDay
                    )
                    .filter(Boolean)
            ).size;
    }


    const dontKnow =
        scienceRecords.filter(
            r => r.dontKnow
        ).length;


    document.getElementById(
        "totalQuestions"
    ).textContent = total;


    document.getElementById(
        "overallRate"
    ).textContent =
        `${rate}%`;


    document.getElementById(
        "studyDays"
    ).textContent = days;


    document.getElementById(
        "dontKnowCount"
    ).textContent = dontKnow;
}

// =====================================================
// ①-2 學習摘要
// =====================================================

function showStudySummary() {

    const area =
        document.getElementById(
            "studySummaryArea"
        );

    if (!area) {
        return;
    }


    const records =
        getCurrentRecords();


    const scienceRecords =
        records.filter(
            record =>
                record.subject === "science" ||
                record.subject === "理化"
        );


    if (scienceRecords.length === 0) {

        area.innerHTML = `
            <p>
                目前沒有這個範圍的學習紀錄。
            </p>
        `;

        return;
    }


    // =================================================
    // 本次整體統計
    // =================================================

    const total =
        scienceRecords.length;


    const correct =
        scienceRecords.filter(
            record => record.correct
        ).length;


    const rate =
        total > 0
            ? Math.round(
                correct / total * 100
            )
            : 0;


    const dontKnow =
        scienceRecords.filter(
            record => record.dontKnow
        ).length;


    // =================================================
    // 依子觀念整理
    // =================================================

    const concepts = {};


    scienceRecords.forEach(record => {

        const key =
            record.concept ||
            record.conceptName ||
            "unknown";


        if (!concepts[key]) {

            concepts[key] = {

                book:
                    record.book,

                unitName:
                    record.unitName ||
                    record.unit ||
                    "未分類",

                conceptName:
                    record.conceptName ||
                    record.topic ||
                    record.concept ||
                    "未分類",

                total: 0,

                correct: 0,

                dontKnow: 0
            };
        }


        concepts[key].total++;


        if (record.correct) {
            concepts[key].correct++;
        }


        if (record.dontKnow) {
            concepts[key].dontKnow++;
        }

    });


    const conceptList =
        Object.values(concepts)
            .map(item => {

                item.rate =
                    item.total > 0
                        ? Math.round(
                            item.correct /
                            item.total *
                            100
                        )
                        : 0;

                item.status =
                    getStatus(
                        item.rate
                    );

                return item;

            })
            .sort(
                (a, b) =>
                    a.rate - b.rate
            );


    // =================================================
    // 目前選擇的範圍
    // =================================================

    const filter =
        document.getElementById(
            "timeFilter"
        )?.value || "latest";


    let title = "";


    if (filter === "latest") {

        const studyDays =
            scienceRecords
                .map(record =>
                    parseInt(
                        record.studyDay
                    )
                )
                .filter(day =>
                    !isNaN(day)
                );


        const latestDay =
            studyDays.length > 0
                ? Math.max(
                    ...studyDays
                )
                : null;


        title =
            latestDay !== null
                ? `第 ${latestDay} 個學習日`
                : "最近一次學習";

    } else if (filter === "today") {

        title = "今天";

    } else if (filter === "3days") {

        title = "最近 3 天";

    } else if (filter === "7days") {

        title = "最近 7 天";

    } else {

        title = "全部學習紀錄";
    }


    // =================================================
    // 上一次學習比較
    // 只有「最近一次」才顯示
    // =================================================

    let comparisonHtml = "";


    if (filter === "latest") {

        const comparison =
            getPreviousStudyComparison();


        if (comparison) {

            const difference =
                rate -
                comparison.rate;


            let changeText = "";


            if (difference > 0) {

                changeText =
                    `📈 比上次進步 ${difference}%`;

            } else if (
                difference < 0
            ) {

                changeText =
                    `📉 比上次下降 ${Math.abs(
                        difference
                    )}%`;

            } else {

                changeText =
                    "➖ 與上次相同";
            }


            comparisonHtml = `

                <div style="
                    margin-top:18px;
                    padding:14px;
                    background:#f5f6f8;
                    border-radius:10px;
                ">

                    <strong>
                        📈 與上一次相比
                    </strong>

                    <div style="
                        margin-top:8px;
                    ">

                        上次：
                        第 ${comparison.studyDay} 個學習日
                        ・${comparison.correct}
                        /
                        ${comparison.total} 題
                        ・${comparison.rate}%

                    </div>

                    <div style="
                        margin-top:6px;
                        font-weight:bold;
                    ">
                        ${changeText}
                    </div>

                </div>
            `;
        }
    }


    // =================================================
    // 子觀念表格
    // =================================================

    let conceptHtml = "";


    conceptList.forEach(item => {

        conceptHtml += `

            <tr>

                <td>
                    第 ${item.book} 冊
                </td>

                <td>
                    ${item.unitName}
                </td>

                <td>
                    <strong>
                        ${item.conceptName}
                    </strong>
                </td>

                <td>
                    ${item.correct}
                    /
                    ${item.total}
                </td>

                <td>
                    ${item.rate}%
                </td>

                <td>
                    ${item.status.icon}
                    ${item.status.text}
                </td>

                <td>
                    ${item.dontKnow > 0
                ? `⚫ ${item.dontKnow}`
                : "—"
            }
                </td>

            </tr>
        `;

    });


    // =================================================
    // 畫面
    // =================================================

    area.innerHTML = `

        <div style="
            font-size:17px;
            margin-bottom:15px;
        ">

            <strong>
                ${title}
            </strong>

            ｜共 ${total} 題
            ｜答對 ${correct} 題
            ｜正確率 ${rate}%

            ${dontKnow > 0
            ? `｜⚫ 不知道 ${dontKnow} 題`
            : ""
        }

        </div>


        <div style="
            overflow-x:auto;
        ">

            <table>

                <thead>

                    <tr>

                        <th>冊別</th>
                        <th>大單元</th>
                        <th>子觀念</th>
                        <th>答對</th>
                        <th>正確率</th>
                        <th>狀態</th>
                        <th>不知道</th>

                    </tr>

                </thead>

                <tbody>
                    ${conceptHtml}
                </tbody>

            </table>

        </div>

        ${comparisonHtml}
    `;
}
// =====================================================
// 找出上一次學習
// =====================================================

function getPreviousStudyComparison() {

    const scienceRecords =
        allRecords.filter(
            record =>
                record.studentId === selectedStudentId &&
                (
                    record.subject === "science" ||
                    record.subject === "理化"
                )
        );


    const studyDays =
        [
            ...new Set(
                scienceRecords
                    .map(record =>
                        parseInt(
                            record.studyDay
                        )
                    )
                    .filter(day =>
                        !isNaN(day)
                    )
            )
        ]
            .sort(
                (a, b) =>
                    b - a
            );


    // 至少需要兩個不同學習日

    if (studyDays.length < 2) {
        return null;
    }


    const previousDay =
        studyDays[1];


    const previousRecords =
        scienceRecords.filter(
            record =>
                parseInt(
                    record.studyDay
                ) === previousDay
        );


    const total =
        previousRecords.length;


    const correct =
        previousRecords.filter(
            record =>
                record.correct
        ).length;


    const rate =
        total > 0
            ? Math.round(
                correct /
                total *
                100
            )
            : 0;


    return {

        studyDay:
            previousDay,

        total:
            total,

        correct:
            correct,

        rate:
            rate

    };
}
// =====================================================
// ② 理化能力地圖
// =====================================================

function showTopicMap() {

    const table =
        document.getElementById(
            "topicTable"
        );


    const stats =
        getConceptStats();


    const concepts =
        Object.values(stats)
            .sort((a, b) => {

                if (a.book !== b.book) {
                    return a.book - b.book;
                }

                if (
                    a.unitName !==
                    b.unitName
                ) {

                    return a.unitName
                        .localeCompare(
                            b.unitName,
                            "zh-TW"
                        );
                }

                return a.conceptName
                    .localeCompare(
                        b.conceptName,
                        "zh-TW"
                    );
            });


    if (concepts.length === 0) {

        table.innerHTML = `
            <tr>
                <td>
                    目前還沒有理化作答紀錄。
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = `

        <tr>
            <th>冊別</th>
            <th>大單元</th>
            <th>子觀念</th>
            <th>作答</th>
            <th>正確率</th>
            <th>狀態</th>
            <th>不知道</th>
        </tr>

    `;


    concepts.forEach(stat => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                第 ${stat.book} 冊
            </td>

            <td>
                ${stat.unitName}
            </td>

            <td>
                <strong>
                    ${stat.conceptName}
                </strong>
            </td>

            <td>
                ${stat.correct}
                /
                ${stat.total}
            </td>

            <td>
                ${stat.rate}%
            </td>

            <td>
                ${stat.status.icon}
                ${stat.status.text}
            </td>

            <td>
                ${stat.dontKnow > 0
                ? `⚫ ${stat.dontKnow}`
                : "—"
            }
            </td>
        `;


        table.appendChild(row);
    });
}


// =====================================================
// ③ 教師優先處理區
// =====================================================

function showPriority() {

    const area =
        document.getElementById(
            "priorityArea"
        );


    const stats =
        Object.values(
            getConceptStats()
        );


    const priority =
        stats
            .filter(
                stat =>
                    stat.rate < 80 ||
                    stat.dontKnow >= 2
            )
            .sort((a, b) => {

                // 「不知道」很多的先處理
                if (
                    a.dontKnow !==
                    b.dontKnow
                ) {

                    return (
                        b.dontKnow -
                        a.dontKnow
                    );
                }

                return (
                    a.rate -
                    b.rate
                );
            });


    if (priority.length === 0) {

        area.innerHTML = `
            <p>
                🟢 目前沒有明顯需要優先處理的觀念。
            </p>
        `;

        return;
    }


    let html = "";


    priority.forEach(
        (stat, index) => {

            let recommendation = "";


            if (
                stat.dontKnow >= 2
            ) {

                recommendation =
                    "⚫ 建議直接講解";

            } else if (
                stat.rate < 60
            ) {

                recommendation =
                    "🔴 建議重新確認核心觀念";

            } else {

                recommendation =
                    "🟡 建議再做少量題目確認";
            }


            html += `

                <div style="
                    margin-bottom:16px;
                    padding:14px;
                    border:1px solid #ddd;
                    border-radius:10px;
                ">

                    <strong>
                        ${index + 1}.
                        ${stat.conceptName}
                    </strong>

                    <br>

                    第 ${stat.book} 冊
                    ・${stat.unitName}

                    <br>

                    正確率：
                    ${stat.rate}%

                    <br>

                    不知道：
                    ${stat.dontKnow} 題

                    <br>

                    <strong>
                        ${recommendation}
                    </strong>

                </div>
            `;
        }
    );


    area.innerHTML = html;
}


// =====================================================
// ④ 錯誤原因
// =====================================================

function showErrorReasons() {

    const records =
        getCurrentRecords();

    const area =
        document.getElementById(
            "errorReasonArea"
        );


    const labels = {

        dontKnow:
            "完全不知道怎麼開始",

        concept:
            "觀念不清楚",

        formula:
            "公式不會使用",

        calculation:
            "計算錯誤",

        misread:
            "看錯題目",

        guess:
            "猜答案"

    };


    const counts = {};


    records.forEach(record => {

        if (record.correct) {
            return;
        }

        if (!record.errorReason) {
            return;
        }


        if (
            !counts[
            record.errorReason
            ]
        ) {

            counts[
                record.errorReason
            ] = 0;
        }


        counts[
            record.errorReason
        ]++;
    });


    const sorted =
        Object.entries(counts)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    if (sorted.length === 0) {

        area.innerHTML = `
            <p>
                目前沒有錯誤原因資料。
            </p>
        `;

        return;
    }


    let html = "";


    sorted.forEach(
        ([reason, count]) => {

            html += `

                <div style="
                    margin-bottom:10px;
                ">

                    <strong>
                        ${labels[reason] ||
                reason
                }
                    </strong>

                    ：${count} 題

                </div>
            `;
        }
    );


    area.innerHTML = html;
}


// =====================================================
// ⑤ 最近錯題
// =====================================================

async function showWrongQuestions() {

    const records =
        getCurrentRecords();

    const area =
        document.getElementById(
            "wrongQuestions"
        );

    const wrong =
        records
            .filter(
                r => !r.correct
            )
            .slice(-10)
            .reverse();


    if (wrong.length === 0) {

        area.innerHTML = `
            <p>
                🎉 目前沒有錯題紀錄。
            </p>
        `;

        return;
    }


    let html = "";


    for (const record of wrong) {


        const question =
            questions.find(
                q =>
                    q.id ===
                    record.questionId
            );


        if (!question) {
            continue;
        }


        let studentAnswer =
            "未作答";


        if (record.dontKnow) {

            studentAnswer =
                "❓ 不知道";

        } else if (
            record.selected !== null &&
            record.selected !== undefined
        ) {

            studentAnswer =
                `${String.fromCharCode(
                    65 + record.selected
                )}. ${question.options[
                record.selected
                ]}`;
        }


        const correctAnswer =
            `${String.fromCharCode(
                65 + question.answer
            )}. ${question.options[
            question.answer
            ]}`;


        // ==========================================
        // 計算過程照片
        // ==========================================

        let photoHtml = "";


        if (record.workPhotoPath) {

            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .storage
                        .from(
                            "study-work-photos"
                        )
                        .createSignedUrl(
                            record.workPhotoPath,
                            3600
                        );


                if (error) {
                    throw error;
                }


                if (
                    data &&
                    data.signedUrl
                ) {

                    photoHtml = `

                        <div style="
                            margin-top:15px;
                            padding:12px;
                            background:#f5f6f8;
                            border-radius:10px;
                        ">

                            <strong>
                                📷 學生計算過程
                            </strong>

                            <div style="
                                margin-top:10px;
                            ">

                                <img
                                    src="${data.signedUrl}"
                                    alt="學生計算過程"
                                    style="
                                        max-width:100%;
                                        max-height:500px;
                                        border-radius:8px;
                                        border:1px solid #ddd;
                                    "
                                >

                            </div>

                        </div>
                    `;
                }

            } catch (error) {

                console.error(
                    "讀取計算照片失敗：",
                    error
                );

                photoHtml = `
                    <p style="color:#c62828;">
                        📷 計算照片讀取失敗
                    </p>
                `;
            }
        }


        html += `

            <div style="
                margin-bottom:20px;
                padding:15px;
                border:1px solid #ddd;
                border-radius:10px;
            ">

                <div>
                    <strong>
                        第 ${question.book} 冊
                        ｜${question.unitName}
                        ｜${question.conceptName}
                    </strong>
                </div>

                <p>
                    ${question.question}
                </p>

                <p>
                    學生答案：
                    <strong>
                        ${studentAnswer}
                    </strong>
                </p>

                <p>
                    正確答案：
                    <strong>
                        ${correctAnswer}
                    </strong>
                </p>

                <p>
                    📖 ${question.explanation}
                </p>

                ${photoHtml}

            </div>
        `;
    }


    area.innerHTML = html;
}


// =====================================================
// 執行
// =====================================================

// =====================================================
// 重新整理整個老師後台
// =====================================================

function renderDashboard() {

    const filterElement =
        document.getElementById(
            "timeFilter"
        );

    const filter =
        filterElement
            ? filterElement.value
            : "latest";


    updateFilterDescription(
        filter
    );

    updateSummaryLabels(
        filter
    );

    showSummary();

    showStudySummary();

    showTopicMap();

    showPriority();

    showErrorReasons();

    showWrongQuestions();
}


// =====================================================
// 顯示目前查看範圍
// =====================================================

function updateFilterDescription(
    filter
) {
    const records =
        getCurrentRecords();
    const area =
        document.getElementById(
            "filterDescription"
        );


    if (!area) {

        return;
    }


    const labels = {

        latest:
            "顯示最近一次完成的學習紀錄",

        today:
            "顯示今天的作答紀錄",

        "3days":
            "顯示最近 3 天的作答紀錄",

        "7days":
            "顯示最近 7 天的作答紀錄",

        all:
            "顯示全部歷史作答紀錄"
    };


    let text =
        labels[filter] ||
        labels.latest;


    // 最近一次額外顯示第幾個學習日

    if (
        filter === "latest" &&
        records.length > 0
    ) {

        const latestDay =
            Math.max(
                ...records
                    .map(record =>
                        parseInt(
                            record.studyDay
                        )
                    )
                    .filter(day =>
                        !isNaN(day)
                    )
            );


        if (!isNaN(latestDay)) {

            text +=
                `｜第 ${latestDay} 個學習日`;
        }
    }


    area.textContent =
        `${text}｜共 ${records.length} 題`;
}


// =====================================================
// 修改統計卡標題
// =====================================================

function updateSummaryLabels(
    filter
) {

    const totalLabel =
        document.getElementById(
            "totalQuestionsLabel"
        );

    const rateLabel =
        document.getElementById(
            "overallRateLabel"
        );

    const dayLabel =
        document.getElementById(
            "studyDaysLabel"
        );


    if (
        !totalLabel ||
        !rateLabel ||
        !dayLabel
    ) {

        return;
    }


    if (filter === "all") {

        totalLabel.textContent =
            "累積作答";

        rateLabel.textContent =
            "總正確率";

        dayLabel.textContent =
            "學習天數";

    } else {

        totalLabel.textContent =
            "作答題數";

        rateLabel.textContent =
            "正確率";

        dayLabel.textContent =
            filter === "latest"
                ? "學習日"
                : "涵蓋學習日";
    }
}


// =====================================================
// 第一次開啟老師後台
// =====================================================

// =====================================================
// 啟動老師後台
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const timeFilter =
            document.getElementById(
                "timeFilter"
            );


        if (timeFilter) {

            timeFilter.addEventListener(
                "change",
                function () {

                    renderDashboard();

                }
            );
        }


        // 第一次進入教師後台
        // 從 Firebase 取得學生作答資料
        await loadRecordsFromFirebase();

    }
);