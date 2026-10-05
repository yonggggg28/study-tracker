let currentQuestions = [];
let currentIndex = 0;
let answers = [];
let currentWorkPhoto = null; // 目前這一題的計算過程照片
// ==========================================
// 本次練習場次
// ==========================================

let currentSessionId = null;
let currentSessionStartedAt = null;

// =====================================================
// 系統設定
// =====================================================

// =====================================================
// 取得目前實際使用的題庫
// 優先使用老師修改後的版本
// =====================================================

function getQuestionBank() {

    const saved =
        JSON.parse(
            localStorage.getItem(
                "questionBankOverrides"
            )
        );

    if (
        saved &&
        Array.isArray(saved)
    ) {
        return saved;
    }

    return questions;
}


// =====================================================
// 只取得「啟用中」的題目
// =====================================================

function getActiveQuestions() {

    return getQuestionBank()
        .filter(
            q => q.active !== false
        );
}

const SETTINGS = {

    // 每天最多幾個新觀念
    newConceptsPerDay: 2,

    // 新觀念初測題數
    initialQuestions: 5,

    // 黃色弱點追加
    yellowReviewQuestions: 2,

    // 紅色弱點追加
    redReviewQuestions: 3,

    // 每日理化上限
    maxDailyQuestions: 15,

    // 綠色觀念幾個學習日後抽查
    greenReviewAfterDays: 3,

    // 綠色抽查題數
    greenReviewQuestions: 1
};


// =====================================================
// 取得目前學習日
// =====================================================

function getStudentStudyDayKey() {

    const currentUser =
        firebase.auth().currentUser;

    if (!currentUser) {
        return null;
    }

    return `scienceStudyDay_${currentUser.uid}`;
}


function getStudyDay() {

    const key =
        getStudentStudyDayKey();

    if (!key) {
        return 1;
    }


    let day =
        parseInt(
            localStorage.getItem(key)
        );


    if (!day || day < 1) {

        day = 1;

        localStorage.setItem(
            key,
            "1"
        );
    }


    return day;
}


// =====================================================
// 讀取歷史紀錄
// =====================================================

// =====================================================
// 取得目前學生專屬的 localStorage key
// =====================================================

function getStudentRecordsKey() {

    const currentUser =
        firebase.auth().currentUser;

    if (!currentUser) {
        return null;
    }

    return `studyRecords_${currentUser.uid}`;
}


// =====================================================
// 讀取目前學生的歷史紀錄
// =====================================================

function getRecords() {

    const key =
        getStudentRecordsKey();

    if (!key) {
        return [];
    }

    return JSON.parse(
        localStorage.getItem(key)
    ) || [];
}


// =====================================================
// 洗牌
// =====================================================

function shuffle(array) {

    const result = [...array];

    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            result[i],
            result[j]
        ] = [
                result[j],
                result[i]
            ];
    }

    return result;
}


// =====================================================
// 從 curriculum.js 取得所有理化觀念
// =====================================================

function getAllScienceConcepts() {

    const result = [];

    curriculum.science.books.forEach(
        bookData => {

            bookData.units.forEach(
                unitData => {

                    unitData.concepts.forEach(
                        conceptData => {

                            result.push({

                                book:
                                    bookData.book,

                                unit:
                                    unitData.id,

                                unitName:
                                    unitData.name,

                                concept:
                                    conceptData.id,

                                conceptName:
                                    conceptData.name

                            });
                        }
                    );
                }
            );
        }
    );

    return result;
}


// =====================================================
// 找某個觀念的題庫
// =====================================================

function getQuestionPool(conceptId) {

    return getActiveQuestions()
        .filter(
            q =>
                q.subject === "science" &&
                q.concept === conceptId
        );
}


// =====================================================
// 判斷哪些觀念目前真的有題目
// =====================================================

function getAvailableConcepts() {

    return getAllScienceConcepts()
        .filter(concept => {

            return (
                getQuestionPool(
                    concept.concept
                ).length > 0
            );
        });
}


// =====================================================
// 舊資料相容
//
// 舊紀錄只有 topic，沒有 concept。
// 這裡嘗試用舊題目的 questionId
// 找回新版 concept。
// =====================================================

function normalizeRecord(record) {

    if (record.concept) {

        return record;
    }


    const question =
        getQuestionBank().find(
            q =>
                q.id === record.questionId
        );


    if (question) {

        return {

            ...record,

            unit:
                question.unit,

            unitName:
                question.unitName,

            concept:
                question.concept,

            conceptName:
                question.conceptName
        };
    }


    return record;
}


// =====================================================
// 取得整理後的歷史紀錄
// =====================================================
// =====================================================
// 從 Firebase 恢復目前學生的歷史紀錄
// =====================================================

async function syncStudentRecordsFromFirebase() {

    const currentUser =
        firebase.auth().currentUser;


    if (!currentUser) {

        throw new Error(
            "目前沒有登入的學生帳號"
        );
    }


    // ==========================================
    // 只讀取目前學生自己的紀錄
    // ==========================================

    const snapshot =
        await db
            .collection("studyRecords")
            .where(
                "studentId",
                "==",
                currentUser.uid
            )
            .get();


    const firebaseRecords =
        snapshot.docs.map(
            doc => doc.data()
        );


    // ==========================================
    // 依作答時間排序
    // ==========================================

    firebaseRecords.sort(
        (a, b) =>
            new Date(a.time) -
            new Date(b.time)
    );


    // ==========================================
    // 儲存到目前學生自己的 localStorage
    // ==========================================

    const recordsKey =
        getStudentRecordsKey();


    if (!recordsKey) {

        throw new Error(
            "無法取得目前學生的本機紀錄位置"
        );
    }


    localStorage.setItem(
        recordsKey,
        JSON.stringify(
            firebaseRecords
        )
    );

    // ==========================================
    // 從 Firebase 歷史恢復目前學習日
    // ==========================================

    const studyDays =
        firebaseRecords
            .map(
                record =>
                    parseInt(
                        record.studyDay
                    )
            )
            .filter(
                day =>
                    !isNaN(day)
            );


    const nextStudyDay =
        studyDays.length > 0
            ? Math.max(...studyDays) + 1
            : 1;


    const studyDayKey =
        getStudentStudyDayKey();


    if (studyDayKey) {

        localStorage.setItem(
            studyDayKey,
            String(nextStudyDay)
        );
    }


    console.log(
        `☁️ 已恢復 ${firebaseRecords.length} 筆學生歷史紀錄`
    );


    return firebaseRecords;
}

function getNormalizedRecords() {

    return getRecords()
        .map(normalizeRecord);
}


// =====================================================
// 取得某觀念所有歷史紀錄
// =====================================================

function getConceptRecords(conceptId) {

    return getNormalizedRecords()
        .filter(
            record =>
                record.concept === conceptId
        );
}


// =====================================================
// 判斷某觀念是否已經初測
//
// 至少做過 3 題，先視為有初測資料。
// 正式題庫完整後可改成 5。
// =====================================================

function hasInitialTest(conceptId) {

    const records =
        getConceptRecords(conceptId);

    return records.length >= 3;
}


// =====================================================
// 分析某觀念
// =====================================================

function analyzeConcept(conceptId) {

    const records =
        getConceptRecords(conceptId);


    if (records.length === 0) {

        return {

            total: 0,

            correct: 0,

            rate: null,

            dontKnow: 0,

            status: "new",

            lastStudyDay: null
        };
    }


    const correct =
        records.filter(
            r => r.correct
        ).length;


    const dontKnow =
        records.filter(
            r => r.dontKnow
        ).length;


    const rate =
        Math.round(
            correct /
            records.length *
            100
        );


    let status = "";


    if (rate >= 80) {

        status = "green";

    } else if (rate >= 60) {

        status = "yellow";

    } else {

        status = "red";
    }


    const studyDays =
        records
            .map(r =>
                parseInt(r.studyDay)
            )
            .filter(day =>
                !isNaN(day)
            );


    const lastStudyDay =
        studyDays.length > 0
            ? Math.max(...studyDays)
            : null;


    return {

        total:
            records.length,

        correct,

        rate,

        dontKnow,

        status,

        lastStudyDay
    };
}


// =====================================================
// 取得尚未初測的新觀念
// =====================================================

function getNewConcepts() {

    const available =
        getAvailableConcepts();


    return available.filter(
        concept =>
            !hasInitialTest(
                concept.concept
            )
    );
}


// =====================================================
// 取得弱點觀念
// =====================================================

function getWeakConcepts() {

    const available =
        getAvailableConcepts();


    const weak = [];


    available.forEach(concept => {

        if (
            !hasInitialTest(
                concept.concept
            )
        ) {

            return;
        }


        const analysis =
            analyzeConcept(
                concept.concept
            );


        if (
            analysis.status === "red" ||
            analysis.status === "yellow"
        ) {

            weak.push({

                ...concept,

                ...analysis
            });
        }
    });


    // 紅色優先，其次正確率較低
    weak.sort((a, b) => {

        if (
            a.status === "red" &&
            b.status !== "red"
        ) {

            return -1;
        }


        if (
            b.status === "red" &&
            a.status !== "red"
        ) {

            return 1;
        }


        return a.rate - b.rate;
    });


    return weak;
}


// =====================================================
// 綠色抽查
// =====================================================

function getGreenReviewConcepts() {

    const currentDay =
        getStudyDay();


    return getAvailableConcepts()
        .map(concept => {

            const analysis =
                analyzeConcept(
                    concept.concept
                );


            return {

                ...concept,

                ...analysis
            };
        })
        .filter(item => {

            if (
                item.status !== "green"
            ) {

                return false;
            }


            if (
                item.lastStudyDay === null
            ) {

                return false;
            }


            return (
                currentDay -
                item.lastStudyDay
                >=
                SETTINGS.greenReviewAfterDays
            );
        });
}


// =====================================================
// 避免重複題目
// =====================================================

function addQuestions(
    target,
    pool,
    count
) {

    const existingIds =
        new Set(
            target.map(q => q.id)
        );


    const available =
        shuffle(pool)
            .filter(
                q =>
                    !existingIds.has(q.id)
            );


    const selected =
        available.slice(0, count);


    target.push(
        ...selected
    );
}


// =====================================================
// 建立今天題目
// =====================================================

function buildDailyQuestions() {

    const result = [];


    // ---------------------------------
    // 1. 先安排兩個新觀念
    // ---------------------------------

    const newConcepts =
        getNewConcepts()
            .slice(
                0,
                SETTINGS.newConceptsPerDay
            );


    newConcepts.forEach(
        concept => {

            const pool =
                getQuestionPool(
                    concept.concept
                );


            addQuestions(
                result,
                pool,
                SETTINGS.initialQuestions
            );
        }
    );


    // ---------------------------------
    // 2. 再安排紅黃弱點
    // ---------------------------------

    const weakConcepts =
        getWeakConcepts();


    weakConcepts.forEach(
        concept => {

            if (
                result.length >=
                SETTINGS.maxDailyQuestions
            ) {

                return;
            }


            // 如果今天本來就是新觀念
            // 不再重複追加
            const alreadyNew =
                newConcepts.some(
                    item =>
                        item.concept ===
                        concept.concept
                );


            if (alreadyNew) {

                return;
            }


            let count = 0;


            if (
                concept.status === "red"
            ) {

                count =
                    SETTINGS
                        .redReviewQuestions;

            } else if (
                concept.status ===
                "yellow"
            ) {

                count =
                    SETTINGS
                        .yellowReviewQuestions;
            }


            const remaining =
                SETTINGS.maxDailyQuestions -
                result.length;


            count =
                Math.min(
                    count,
                    remaining
                );


            addQuestions(
                result,
                getQuestionPool(
                    concept.concept
                ),
                count
            );
        }
    );


    // ---------------------------------
    // 3. 還有空間才放綠色抽查
    // ---------------------------------

    if (
        result.length <
        SETTINGS.maxDailyQuestions
    ) {

        const green =
            getGreenReviewConcepts();


        for (
            const concept of green
        ) {

            if (
                result.length >=
                SETTINGS.maxDailyQuestions
            ) {

                break;
            }


            addQuestions(
                result,
                getQuestionPool(
                    concept.concept
                ),
                SETTINGS.greenReviewQuestions
            );
        }
    }


    return shuffle(
        result.slice(
            0,
            SETTINGS.maxDailyQuestions
        )
    );
}
// ==========================================
// 建立新的練習場次
// ==========================================

function createScienceSession() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");

    currentSessionId =
        `SCI-${year}${month}${day}-${hour}${minute}${second}`;

    currentSessionStartedAt = now.toISOString();
}
// =====================================================
// 開始理化
// =====================================================

function startScience() {

    createScienceSession(); answers = [];
    currentIndex = 0;


    currentQuestions =
        buildDailyQuestions();


    if (
        currentQuestions.length === 0
    ) {

        alert(
            "目前沒有可以安排的題目。之後增加正式題庫後，就會繼續自動安排。"
        );

        return;
    }


    document
        .getElementById("homePage")
        .style.display = "none";


    document
        .getElementById("quizPage")
        .style.display = "block";


    showQuestion();
}


// =====================================================
// 顯示題目
// =====================================================

function showQuestion() {

    const q =
        currentQuestions[
        currentIndex
        ];


    document
        .getElementById(
            "questionNumber"
        )
        .textContent =
        `第 ${currentIndex + 1} / ${currentQuestions.length} 題`;


    document
        .getElementById(
            "questionTag"
        )
        .textContent =
        `第 ${q.book} 冊｜${q.unitName}｜${q.conceptName}｜${q.typeName}`;


    document
        .getElementById(
            "questionText"
        )
        .textContent =
        q.question;


    const optionsArea =
        document.getElementById(
            "optionsArea"
        );


    optionsArea.innerHTML = "";


    q.options.forEach(
        (option, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.textContent =
                `${String.fromCharCode(
                    65 + index
                )}. ${option}`;


            button.style.display =
                "block";

            button.style.margin =
                "10px 0";

            button.style.padding =
                "12px";

            button.style.width =
                "100%";


            button.onclick =
                () =>
                    submitAnswer(
                        index
                    );


            optionsArea.appendChild(
                button
            );
        }
    );


    // ---------------------------------
    // 不知道
    // ---------------------------------

    const dontKnowButton =
        document.createElement(
            "button"
        );


    dontKnowButton.textContent =
        "❓ 我不知道怎麼做";


    dontKnowButton.style.display =
        "block";

    dontKnowButton.style.marginTop =
        "20px";

    dontKnowButton.style.padding =
        "12px";

    dontKnowButton.style.width =
        "100%";


    dontKnowButton.onclick =
        submitDontKnow;


    optionsArea.appendChild(
        dontKnowButton
    );


    // ---------------------------------
    // 計算過程提示
    // ---------------------------------

    const workArea =
        document.getElementById(
            "workArea"
        );


    // 每一題開始時先清除上一題的照片
    currentWorkPhoto = null;

    if (q.requireWork) {

        workArea.innerHTML = `
        <div style="
            margin: 16px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 10px;
        ">

            <p>
                📝 <strong>
                    這題需要保留計算過程
                </strong>
            </p>

            <p>
                請先在紙上完成計算，
                再拍下計算過程。
            </p>

            <label
                for="workPhotoInput"
                style="
                    display:inline-block;
                    padding:10px 16px;
                    border:1px solid #999;
                    border-radius:8px;
                    cursor:pointer;
                "
            >
                📷 拍照／選擇照片
            </label>

            <input
                id="workPhotoInput"
                type="file"
                accept="image/*"
                capture="environment"
                style="display:none;"
                onchange="previewWorkPhoto(event)"
            >

            <div
                id="workPhotoPreview"
                style="margin-top:15px;"
            ></div>


        </div>
    `;

    } else {

        workArea.innerHTML = "";
    }


    document
        .getElementById(
            "feedback"
        )
        .innerHTML = "";
}
// =====================================================
// 計算過程照片預覽
// =====================================================

function previewWorkPhoto(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }


    // 目前先把原始 File 暫存在記憶體
    // 下一階段接 Firebase 時會使用
    currentWorkPhoto = file;


    const preview =
        document.getElementById(
            "workPhotoPreview"
        );


    const imageURL =
        URL.createObjectURL(file);


    preview.innerHTML = `
        <p>
            ✅ 已選擇計算過程照片
        </p>

        <img
            src="${imageURL}"
            alt="計算過程預覽"
            style="
                max-width:100%;
                max-height:350px;
                border-radius:8px;
                border:1px solid #ddd;
            "
        >

        <p style="
            font-size:14px;
            color:#666;
        ">
            如果照片不清楚，
            可以再次點擊上方按鈕重新拍攝。
        </p>
    `;
}


// =====================================================
// 建立作答紀錄
// =====================================================

function createAnswerRecord(
    q,
    selected,
    correct,
    dontKnow
) {
    return {
        questionId: q.id,

        subject: q.subject,
        subjectName: q.subjectName,

        book: q.book,

        unit: q.unit,
        unitName: q.unitName,

        concept: q.concept,
        conceptName: q.conceptName,

        type: q.type,
        typeName: q.typeName,

        difficulty: q.difficulty,

        selected: selected,
        correct: correct,
        dontKnow: dontKnow,

        errorReason:
            dontKnow
                ? "dontKnow"
                : null,

        // ==========================
        // 作答時間與練習場次
        // ==========================

        time: new Date().toISOString(),

        sessionId: currentSessionId,

        sessionStartedAt:
            currentSessionStartedAt,

        studyDay: getStudyDay()
    };
}


// =====================================================
// 一般作答
// =====================================================

async function submitAnswer(selectedIndex) {

    const q =
        currentQuestions[
        currentIndex
        ];


    // ==========================================
    // 計算題一定要先有照片
    // ==========================================

    if (
        q.requireWork &&
        !currentWorkPhoto
    ) {

        alert(
            "📷 這題需要先拍下計算過程，才能送出答案！"
        );

        return;
    }


    // ==========================================
    // 如果需要計算過程，自動上傳照片
    // ==========================================

    let workPhotoPath = null;

    if (q.requireWork) {

        try {

            workPhotoPath =
                await uploadWorkPhoto(q);

        } catch (error) {

            console.error(
                "📷 計算照片上傳失敗：",
                error
            );

            alert(
                "📷 照片上傳失敗，請重新選擇照片後再送出。\n\n" +
                (error.message || String(error))
            );

            return;
        }
    }


    // ==========================================
    // 判斷答案
    // ==========================================

    const isCorrect =
        selectedIndex ===
        q.answer;


    // ==========================================
    // 建立作答紀錄
    // ==========================================

    const answerRecord =
        createAnswerRecord(
            q,
            selectedIndex,
            isCorrect,
            false
        );


    // 把 Supabase 照片位置記進這題
    answerRecord.workPhotoPath =
        workPhotoPath;


    answers.push(
        answerRecord
    );


    // ==========================================
    // 顯示答題結果
    // ==========================================

    showFeedback(
        q,
        isCorrect
    );
}


// =====================================================
// 不知道
// =====================================================

function submitDontKnow() {

    const q =
        currentQuestions[
        currentIndex
        ];


    answers.push(
        createAnswerRecord(
            q,
            null,
            false,
            true
        )
    );


    const feedback =
        document.getElementById(
            "feedback"
        );


    feedback.innerHTML = `

        <h3>
            ❓ 這題先記錄為「不知道」
        </h3>

        <p>
            正確答案：
            ${String.fromCharCode(
        65 + q.answer
    )}.
            ${q.options[q.answer]}
        </p>

        <p>
            ${q.explanation}
        </p>

        <button onclick="nextQuestion()">
            下一題
        </button>
    `;
}


// =====================================================
// 顯示作答結果
// =====================================================

function showFeedback(
    q,
    isCorrect
) {

    const feedback =
        document.getElementById(
            "feedback"
        );


    if (isCorrect) {

        feedback.innerHTML = `

            <h3>
                ✅ 答對了！
            </h3>

            <p>
                ${q.explanation}
            </p>

            <button onclick="nextQuestion()">
                下一題
            </button>
        `;

        return;
    }


    feedback.innerHTML = `

        <h3>
            ❌ 答錯了
        </h3>

        <p>
            正確答案：
            ${String.fromCharCode(
        65 + q.answer
    )}.
            ${q.options[q.answer]}
        </p>

        <p>
            ${q.explanation}
        </p>

        <p>
            <strong>
                這題主要是哪裡卡住？
            </strong>
        </p>

        <select id="errorReason">

            <option value="">
                請選擇
            </option>

            <option value="dontKnow">
                完全不知道怎麼開始
            </option>

            <option value="concept">
                觀念不清楚
            </option>

            <option value="formula">
                公式不會使用
            </option>

            <option value="calculation">
                計算錯誤
            </option>

            <option value="misread">
                看錯題目
            </option>

            <option value="guess">
                我是猜的
            </option>

        </select>

        <br><br>

        <button onclick="saveReasonAndNext()">
            下一題
        </button>
    `;
}


// =====================================================
// 儲存錯誤原因
// =====================================================

function saveReasonAndNext() {

    const select =
        document.getElementById(
            "errorReason"
        );


    const reason =
        select.value;


    // 要求一定選一個
    if (!reason) {

        alert(
            "請先選擇這題卡住的原因。"
        );

        return;
    }


    answers[
        answers.length - 1
    ].errorReason =
        reason;


    nextQuestion();
}


// =====================================================
// 下一題
// =====================================================

function nextQuestion() {

    currentIndex++;


    if (
        currentIndex >=
        currentQuestions.length
    ) {

        finishQuiz();

    } else {

        showQuestion();
    }
}


// =====================================================
// 本次測驗分析
// =====================================================

function getSessionConceptStats() {

    const stats = {};


    answers.forEach(
        answer => {

            if (
                !stats[
                answer.concept
                ]
            ) {

                stats[
                    answer.concept
                ] = {

                    conceptName:
                        answer.conceptName,

                    total: 0,

                    correct: 0,

                    dontKnow: 0
                };
            }


            const stat =
                stats[
                answer.concept
                ];


            stat.total++;


            if (answer.correct) {

                stat.correct++;
            }


            if (answer.dontKnow) {

                stat.dontKnow++;
            }
        }
    );


    return stats;
}


// =====================================================
// 完成測驗
// =====================================================

async function finishQuiz() {

    const studyDay =
        getStudyDay();


    // 先儲存本次作答紀錄
    // 老師端仍然可以看到完整資料
    try {

        await saveRecords(
            studyDay
        );

    } catch (error) {

        alert(
            "作答紀錄尚未成功儲存，請不要關閉頁面。"
        );

        return;
    }


    // 計算本次總題數
    const total =
        answers.length;


    // 計算錯誤題數
    // 「不知道」本身 correct 也是 false，
    // 所以會自然算進錯題，不會重複計算
    const wrong =
        answers.filter(
            answer => !answer.correct
        ).length;


    // 隱藏答題頁
    document
        .getElementById(
            "quizPage"
        )
        .style.display =
        "none";


    // 顯示結果頁
    document
        .getElementById(
            "resultPage"
        )
        .style.display =
        "block";


    // 學生端只顯示簡單結果
    const resultHTML = `

        <h2>
            🎉 今日理化完成！
        </h2>

        <p>
            共完成
            <strong>
                ${total}
            </strong>
            題
        </p>

        <p>
            ❌ 錯誤
            <strong>
                ${wrong}
            </strong>
            題
        </p>

        <br>

        <button onclick="backHome()">
            回首頁
        </button>
    `;


    document
        .getElementById(
            "resultContent"
        )
        .innerHTML =
        resultHTML;


    // 完整完成後才增加學習日
    const studyDayKey =
        getStudentStudyDayKey();

    if (studyDayKey) {

        localStorage.setItem(
            studyDayKey,
            String(
                studyDay + 1
            )
        );
    }
}

// =====================================================
// 儲存紀錄
// =====================================================

async function saveRecords(studyDay) {

    // ==========================================
    // 取得目前登入的學生
    // ==========================================

    const currentUser =
        firebase.auth().currentUser;


    if (!currentUser) {

        throw new Error(
            "目前沒有登入的學生帳號"
        );
    }


    // ==========================================
    // 取得學生資料
    // ==========================================

    const userDoc =
        await db
            .collection("users")
            .doc(currentUser.uid)
            .get();


    if (!userDoc.exists) {

        throw new Error(
            "找不到目前學生的使用者資料"
        );
    }


    const userData =
        userDoc.data();


    // ==========================================
    // 每筆作答加入學生身分
    // ==========================================

    const recordsWithDay =
        answers.map(answer => ({

            ...answer,

            studyDay,

            studentId:
                currentUser.uid,

            studentEmail:
                currentUser.email,

            studentName:
                userData.name || "未命名學生"

        }));

    // ==========================================
    // 1. 儲存到目前學生專屬的本機紀錄
    // ==========================================

    const recordsKey =
        getStudentRecordsKey();

    if (!recordsKey) {

        throw new Error(
            "無法取得目前學生的本機紀錄位置"
        );
    }


    const oldRecords =
        getRecords();


    oldRecords.push(
        ...recordsWithDay
    );


    localStorage.setItem(
        recordsKey,
        JSON.stringify(oldRecords)
    );

    // 2. 等待 Firebase 儲存完成
    await saveRecordsToFirebase(
        recordsWithDay
    );
}


// =====================================================
// 將作答紀錄同步到 Firebase
// =====================================================

async function saveRecordsToFirebase(records) {

    try {

        for (const record of records) {

            const timeId =
                new Date(record.time)
                    .getTime();

            const documentId =
                `${record.sessionId}__${record.questionId}__${timeId}`;

            await db
                .collection("studyRecords")
                .doc(documentId)
                .set(record);
        }

        alert(
            `✅ Firebase 儲存成功！共 ${records.length} 筆`
        );

    } catch (error) {

        console.error(
            "Firebase 作答紀錄同步失敗：",
            error
        );

        alert(
            "❌ Firebase 儲存失敗\n\n" +
            "錯誤代碼：" +
            (error.code || "無") +
            "\n\n錯誤內容：" +
            (error.message || String(error))
        );

        throw error;
    }
}


// =====================================================
// 回首頁
// =====================================================

function backHome() {

    document
        .getElementById(
            "resultPage"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "homePage"
        )
        .style.display =
        "block";


    updateHome();
}


// =====================================================
// 首頁資訊
// =====================================================

function updateHome() {

    const display =
        document.getElementById(
            "scienceDayDisplay"
        );

    if (!display) {
        return;
    }

    const studyDay =
        getStudyDay();

    display.innerHTML = `
        <strong>
            第 ${studyDay} 個學習日
        </strong>
    `;
}


// =====================================================
// 開啟網頁
// 登入確認後，先恢復學生資料，再顯示首頁
// =====================================================

firebase.auth().onAuthStateChanged(
    async function (user) {

        if (!user) {
            return;
        }

        try {

            console.log(
                "👤 準備恢復學生資料：",
                user.email
            );


            // 先從 Firebase 抓回目前學生的歷史
            await syncStudentRecordsFromFirebase();


            // Firebase 同步完成後
            // 才更新學生首頁
            updateHome();


            console.log(
                "✅ 學生學習進度恢復完成"
            );

        } catch (error) {

            console.error(
                "學生學習進度恢復失敗：",
                error
            );


            alert(
                "⚠️ 學習進度載入失敗\n\n" +
                (error.message || String(error))
            );
        }
    }
);

// =====================================================
// Firebase 連線測試
// =====================================================

async function testFirebase() {

    try {

        await db
            .collection("connectionTests")
            .add({
                message: "學生端 Firebase 連線成功",
                time: new Date().toISOString()
            });

        console.log(
            "🔥 Firestore 寫入成功！"
        );

        alert(
            "🔥 Firebase 連線成功！"
        );

    } catch (error) {

        console.error(
            "Firebase 寫入失敗：",
            error
        );

        alert(
            "Firebase 連線失敗，請查看 Console。"
        );
    }
}

async function uploadWorkPhoto(q) {

    if (!currentWorkPhoto) {
        return null;
    }

    try {

        const extension =
            currentWorkPhoto.name
                .split(".")
                .pop()
                .toLowerCase();

        const fileName =
            `${currentSessionId}/${q.id}-${Date.now()}.${extension}`;

        const { data, error } =
            await supabaseClient
                .storage
                .from("study-work-photos")
                .upload(
                    fileName,
                    currentWorkPhoto,
                    {
                        cacheControl: "3600",
                        upsert: false
                    }
                );

        if (error) {
            throw error;
        }

        console.log(
            "📷 計算照片上傳成功：",
            data.path
        );

        return data.path;

    } catch (error) {

        console.error(
            "📷 計算照片上傳失敗：",
            error
        );

        alert(
            "📷 照片上傳失敗，請重新選擇照片後再送出。\n\n" +
            (error.message || String(error))
        );

        return;
    }
}