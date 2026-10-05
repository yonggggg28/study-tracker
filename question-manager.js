let questionBank = [];
let editingId = null;
let isCreating = false;

// CSV 匯入時，暫時存放通過檢查的題目
let pendingImportQuestions = [];


// ==========================================
// 學生畫面預覽
// ==========================================

function previewQuestion() {

    const questionText =
        document.getElementById(
            "editQuestion"
        ).value.trim();


    const options = [

        document.getElementById(
            "editA"
        ).value.trim(),

        document.getElementById(
            "editB"
        ).value.trim(),

        document.getElementById(
            "editC"
        ).value.trim(),

        document.getElementById(
            "editD"
        ).value.trim()

    ];


    if (!questionText) {

        alert("請先輸入題目。");
        return;
    }


    const book =
        Number(
            document.getElementById(
                "editBook"
            ).value
        );


    const unitId =
        document.getElementById(
            "editUnit"
        ).value;


    const conceptId =
        document.getElementById(
            "editConcept"
        ).value;


    const unit =
        getUnit(
            book,
            unitId
        );


    const concept =
        getConcept(
            book,
            unitId,
            conceptId
        );


    // --------------------------
    // 標籤
    // --------------------------

    document.getElementById(
        "previewTag"
    ).textContent =

        `第 ${book} 冊｜` +
        `${unit ? unit.name : unitId}｜` +
        `${concept ? concept.name : conceptId}`;


    // --------------------------
    // 題目
    // --------------------------

    document.getElementById(
        "previewQuestion"
    ).textContent =
        questionText;


    // --------------------------
    // 選項
    // --------------------------

    const optionsArea =
        document.getElementById(
            "previewOptions"
        );


    optionsArea.innerHTML = "";


    options.forEach(
        (option, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.textContent =
                `${String.fromCharCode(
                    65 + index
                )}. ${option || "（尚未輸入）"}`;


            button.style.cssText = `
                display:block;
                width:100%;
                text-align:left;
                padding:14px;
                margin:10px 0;
                background:#f7f9fc;
                color:#263238;
                border:1px solid #d9e1ea;
                border-radius:10px;
                cursor:default;
            `;


            optionsArea.appendChild(
                button
            );
        }
    );


    // --------------------------
    // 計算題提示
    // --------------------------

    const requireWork =
        document.getElementById(
            "editRequireWork"
        ).value === "true";


    document.getElementById(
        "previewWork"
    ).innerHTML =
        requireWork
            ? `
                <div style="
                    background:#fff7e6;
                    padding:12px;
                    border-radius:10px;
                    margin:15px 0;
                ">
                    📝 這題需要保留計算過程
                </div>
            `
            : "";


    // --------------------------
    // 老師檢查答案
    // --------------------------

    const answer =
        Number(
            document.getElementById(
                "editAnswer"
            ).value
        );


    document.getElementById(
        "previewAnswer"
    ).innerHTML =

        `正確答案：
        <strong>
            ${String.fromCharCode(65 + answer)}.
            ${options[answer] || "尚未輸入"}
        </strong>`;


    const explanation =
        document.getElementById(
            "editExplanation"
        ).value.trim();


    document.getElementById(
        "previewExplanation"
    ).textContent =

        explanation
            ? `解析：${explanation}`
            : "解析：尚未輸入";


    // --------------------------
    // 開啟預覽
    // --------------------------

    document.getElementById(
        "previewModal"
    ).style.display =
        "block";
}


// ==========================================
// 關閉預覽
// ==========================================

function closePreview() {

    document.getElementById(
        "previewModal"
    ).style.display =
        "none";
}
// ==========================================
// 初始化題庫
// ==========================================

function initializeBank() {

    const saved = JSON.parse(
        localStorage.getItem("questionBankOverrides")
    );


    if (saved && Array.isArray(saved)) {

        questionBank = saved;

    } else {

        questionBank = questions.map(q => ({
            ...q,
            active: q.active !== false
        }));
    }
}


function saveBank() {

    localStorage.setItem(
        "questionBankOverrides",
        JSON.stringify(questionBank)
    );
}


// ==========================================
// 課程資料
// ==========================================

function getScienceBooks() {
    return curriculum.science.books;
}


function getBook(bookNumber) {

    return getScienceBooks().find(
        b => b.book === Number(bookNumber)
    );
}


function getUnit(
    bookNumber,
    unitId
) {

    const book =
        getBook(bookNumber);

    if (!book) return null;

    return book.units.find(
        u => u.id === unitId
    );
}


function getConcept(
    bookNumber,
    unitId,
    conceptId
) {

    const unit =
        getUnit(
            bookNumber,
            unitId
        );

    if (!unit) return null;

    return unit.concepts.find(
        c => c.id === conceptId
    );
}


// ==========================================
// 篩選選單
// ==========================================

function buildFilters() {

    const bookFilter =
        document.getElementById(
            "bookFilter"
        );


    getScienceBooks().forEach(book => {

        const option =
            document.createElement("option");

        option.value =
            book.book;

        option.textContent =
            `第 ${book.book} 冊`;

        bookFilter.appendChild(option);
    });


    bookFilter.addEventListener(
        "change",
        () => {
            updateUnitFilter();
            renderQuestions();
        }
    );


    document
        .getElementById("unitFilter")
        .addEventListener(
            "change",
            () => {
                updateConceptFilter();
                renderQuestions();
            }
        );


    document
        .getElementById("conceptFilter")
        .addEventListener(
            "change",
            renderQuestions
        );


    document
        .getElementById("searchInput")
        .addEventListener(
            "input",
            renderQuestions
        );


    updateUnitFilter();
}


function updateUnitFilter() {

    const bookValue =
        document.getElementById(
            "bookFilter"
        ).value;


    const unitFilter =
        document.getElementById(
            "unitFilter"
        );


    unitFilter.innerHTML =
        `<option value="">
            全部單元
        </option>`;


    getScienceBooks()
        .filter(
            b =>
                !bookValue ||
                b.book === Number(bookValue)
        )
        .forEach(book => {

            book.units.forEach(unit => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    unit.id;

                option.textContent =
                    unit.name;

                unitFilter.appendChild(
                    option
                );
            });
        });


    updateConceptFilter();
}


function updateConceptFilter() {

    const bookValue =
        document.getElementById(
            "bookFilter"
        ).value;


    const unitValue =
        document.getElementById(
            "unitFilter"
        ).value;


    const conceptFilter =
        document.getElementById(
            "conceptFilter"
        );


    conceptFilter.innerHTML =
        `<option value="">
            全部觀念
        </option>`;


    getScienceBooks()
        .filter(
            b =>
                !bookValue ||
                b.book === Number(bookValue)
        )
        .forEach(book => {

            book.units
                .filter(
                    unit =>
                        !unitValue ||
                        unit.id === unitValue
                )
                .forEach(unit => {

                    unit.concepts.forEach(
                        concept => {

                            const option =
                                document.createElement(
                                    "option"
                                );

                            option.value =
                                concept.id;

                            option.textContent =
                                concept.name;

                            conceptFilter
                                .appendChild(
                                    option
                                );
                        }
                    );
                });
        });
}


// ==========================================
// 題庫概況
// ==========================================

function renderSummary() {

    const active =
        questionBank.filter(
            q => q.active !== false
        );


    const conceptSet =
        new Set(
            questionBank.map(
                q => q.concept
            )
        );


    let shortage = 0;


    getScienceBooks()
        .forEach(book => {

            book.units.forEach(unit => {

                unit.concepts.forEach(
                    concept => {

                        const count =
                            active.filter(
                                q =>
                                    q.concept ===
                                    concept.id
                            ).length;

                        // 暫定至少 5 題
                        if (count < 5) {
                            shortage++;
                        }
                    }
                );
            });
        });


    document.getElementById(
        "totalQuestions"
    ).textContent =
        questionBank.length;


    document.getElementById(
        "activeQuestions"
    ).textContent =
        active.length;


    document.getElementById(
        "conceptCount"
    ).textContent =
        conceptSet.size;


    document.getElementById(
        "shortageCount"
    ).textContent =
        shortage;
}


// ==========================================
// 顯示題目
// ==========================================

function renderQuestions() {

    const search =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .trim()
            .toLowerCase();


    const book =
        document.getElementById(
            "bookFilter"
        ).value;


    const unit =
        document.getElementById(
            "unitFilter"
        ).value;


    const concept =
        document.getElementById(
            "conceptFilter"
        ).value;


    const filtered =
        questionBank.filter(q => {

            if (
                book &&
                q.book !== Number(book)
            ) {
                return false;
            }


            if (
                unit &&
                q.unit !== unit
            ) {
                return false;
            }


            if (
                concept &&
                q.concept !== concept
            ) {
                return false;
            }


            if (search) {

                const text = `
                    ${q.id}
                    ${q.question}
                    ${q.conceptName || ""}
                `.toLowerCase();


                if (
                    !text.includes(search)
                ) {
                    return false;
                }
            }


            return true;
        });


    const area =
        document.getElementById(
            "questionList"
        );


    if (
        filtered.length === 0
    ) {

        area.innerHTML =
            "<p>沒有符合條件的題目。</p>";

        return;
    }


    area.innerHTML = "";


    filtered.forEach(q => {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "question" +
            (
                q.active === false
                    ? " disabled"
                    : ""
            );


        div.innerHTML = `

            <div class="question-top">

                <div>

                    <div class="question-id">
                        ${q.id}
                    </div>

                    <span class="tag">
                        第 ${q.book} 冊
                    </span>

                    <span class="tag">
                        ${q.unitName}
                    </span>

                    <span class="tag">
                        ${q.conceptName}
                    </span>

                    <span class="tag">
                        難度 ${q.difficulty}
                    </span>

                </div>

                <div>

                    ${q.active === false
                ? "⏸ 已停用"
                : "✅ 啟用中"
            }

                </div>

            </div>

            <p>
                <strong>
                    ${q.question}
                </strong>
            </p>

            <button
                class="primary"
                onclick="editQuestion('${q.id}')"
            >
                編輯
            </button>
        `;


        area.appendChild(div);
    });


    renderSummary();
}

// ==========================================
// 新增題目
// ==========================================

function createQuestion() {

    isCreating = true;
    editingId = null;

    const books =
        getScienceBooks();

    if (books.length === 0) {
        alert("找不到課程資料。");
        return;
    }

    const firstBook =
        books[0];

    const firstUnit =
        firstBook.units[0];

    const firstConcept =
        firstUnit.concepts[0];


    document.getElementById(
        "editorArea"
    ).style.display = "block";


    document.getElementById(
        "editId"
    ).value = "儲存後自動產生";


    buildEditorBooks(
        firstBook.book,
        firstUnit.id,
        firstConcept.id
    );


    document.getElementById(
        "editType"
    ).value = "concept";


    document.getElementById(
        "editDifficulty"
    ).value = "1";


    document.getElementById(
        "editQuestion"
    ).value = "";


    document.getElementById(
        "editA"
    ).value = "";


    document.getElementById(
        "editB"
    ).value = "";


    document.getElementById(
        "editC"
    ).value = "";


    document.getElementById(
        "editD"
    ).value = "";


    document.getElementById(
        "editAnswer"
    ).value = "0";


    document.getElementById(
        "editExplanation"
    ).value = "";


    document.getElementById(
        "editRequireWork"
    ).value = "false";


    // 新增模式不需要停用按鈕
    document.getElementById(
        "toggleButton"
    ).style.display = "none";


    document.getElementById(
        "editorArea"
    ).scrollIntoView({
        behavior: "smooth"
    });
}

// ==========================================
// 編輯
// ==========================================

function editQuestion(id) {

    isCreating = false;

    const q = questionBank.find((item) => item.id === id);

    if (!q) return;

    editingId = id;


    document.getElementById(
        "editorArea"
    ).style.display =
        "block";


    document.getElementById(
        "editId"
    ).value =
        q.id;


    buildEditorBooks(
        q.book,
        q.unit,
        q.concept
    );


    document.getElementById(
        "editType"
    ).value =
        q.type;


    document.getElementById(
        "editDifficulty"
    ).value =
        q.difficulty;


    document.getElementById(
        "editQuestion"
    ).value =
        q.question;


    document.getElementById(
        "editA"
    ).value =
        q.options[0] || "";


    document.getElementById(
        "editB"
    ).value =
        q.options[1] || "";


    document.getElementById(
        "editC"
    ).value =
        q.options[2] || "";


    document.getElementById(
        "editD"
    ).value =
        q.options[3] || "";


    document.getElementById(
        "editAnswer"
    ).value =
        q.answer;


    document.getElementById(
        "editExplanation"
    ).value =
        q.explanation || "";


    document.getElementById(
        "editRequireWork"
    ).value =
        String(
            q.requireWork === true
        );


    updateToggleButton(q);


    document.getElementById(
        "editorArea"
    ).scrollIntoView({
        behavior: "smooth"
    });
}


// ==========================================
// 編輯器分類
// ==========================================

function buildEditorBooks(
    selectedBook,
    selectedUnit,
    selectedConcept
) {

    const bookSelect =
        document.getElementById(
            "editBook"
        );


    bookSelect.innerHTML = "";


    getScienceBooks().forEach(book => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            book.book;

        option.textContent =
            `第 ${book.book} 冊`;

        bookSelect.appendChild(
            option
        );
    });


    bookSelect.value =
        selectedBook;


    bookSelect.onchange =
        () =>
            buildEditorUnits(
                bookSelect.value
            );


    buildEditorUnits(
        selectedBook,
        selectedUnit,
        selectedConcept
    );
}


function buildEditorUnits(
    bookNumber,
    selectedUnit = null,
    selectedConcept = null
) {

    const unitSelect =
        document.getElementById(
            "editUnit"
        );


    unitSelect.innerHTML = "";


    const book =
        getBook(bookNumber);


    if (!book) return;


    book.units.forEach(unit => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            unit.id;

        option.textContent =
            unit.name;

        unitSelect.appendChild(
            option
        );
    });


    if (selectedUnit) {

        unitSelect.value =
            selectedUnit;
    }


    unitSelect.onchange =
        () =>
            buildEditorConcepts(
                bookNumber,
                unitSelect.value
            );


    buildEditorConcepts(
        bookNumber,
        unitSelect.value,
        selectedConcept
    );
}


function buildEditorConcepts(
    bookNumber,
    unitId,
    selectedConcept = null
) {

    const conceptSelect =
        document.getElementById(
            "editConcept"
        );


    conceptSelect.innerHTML = "";


    const unit =
        getUnit(
            bookNumber,
            unitId
        );


    if (!unit) return;


    unit.concepts.forEach(
        concept => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                concept.id;

            option.textContent =
                concept.name;

            conceptSelect
                .appendChild(option);
        }
    );


    if (selectedConcept) {

        conceptSelect.value =
            selectedConcept;
    }
}

function generateQuestionId(
    book,
    concept
) {

    const prefix =
        `SCI-B${book}-${concept.toUpperCase()}`;


    const sameConcept =
        questionBank.filter(
            q =>
                q.book === book &&
                q.concept === concept
        );


    let number = 1;
    let id = "";


    do {

        id =
            `${prefix}-${String(number).padStart(3, "0")}`;

        number++;

    } while (
        questionBank.some(
            q => q.id === id
        )
    );


    return id;
}

// ==========================================
// 儲存修改
// ==========================================

function saveQuestion() {

    const bookNumber =
        Number(
            document.getElementById(
                "editBook"
            ).value
        );


    const unitId =
        document.getElementById(
            "editUnit"
        ).value;


    const conceptId =
        document.getElementById(
            "editConcept"
        ).value;


    const questionText =
        document.getElementById(
            "editQuestion"
        ).value.trim();


    const options = [

        document.getElementById(
            "editA"
        ).value.trim(),

        document.getElementById(
            "editB"
        ).value.trim(),

        document.getElementById(
            "editC"
        ).value.trim(),

        document.getElementById(
            "editD"
        ).value.trim()

    ];


    // ------------------------------
    // 基本檢查
    // ------------------------------

    if (!questionText) {

        alert("請輸入題目。");
        return;
    }


    if (
        options.some(
            option => !option
        )
    ) {

        alert("A、B、C、D 四個選項都要填寫。");
        return;
    }


    const unit =
        getUnit(
            bookNumber,
            unitId
        );


    const concept =
        getConcept(
            bookNumber,
            unitId,
            conceptId
        );


    const type =
        document.getElementById(
            "editType"
        ).value;


    const typeNames = {

        concept: "觀念",

        calculation: "計算",

        application: "應用"
    };


    // ------------------------------
    // 新增模式
    // ------------------------------

    if (isCreating) {

        const newId =
            generateQuestionId(
                bookNumber,
                conceptId
            );


        const newQuestion = {

            id:
                newId,

            subject:
                "science",

            subjectName:
                "理化",

            book:
                bookNumber,

            unit:
                unitId,

            unitName:
                unit
                    ? unit.name
                    : unitId,

            concept:
                conceptId,

            conceptName:
                concept
                    ? concept.name
                    : conceptId,

            type:
                type,

            typeName:
                typeNames[type] ||
                type,

            difficulty:
                Number(
                    document.getElementById(
                        "editDifficulty"
                    ).value
                ),

            question:
                questionText,

            options:
                options,

            answer:
                Number(
                    document.getElementById(
                        "editAnswer"
                    ).value
                ),

            explanation:
                document.getElementById(
                    "editExplanation"
                ).value.trim(),

            requireWork:
                document.getElementById(
                    "editRequireWork"
                ).value === "true",

            active:
                true
        };


        questionBank.push(
            newQuestion
        );


        saveBank();


        isCreating = false;

        editingId =
            newQuestion.id;


        document.getElementById(
            "editId"
        ).value =
            newQuestion.id;


        document.getElementById(
            "toggleButton"
        ).style.display =
            "inline-block";


        updateToggleButton(
            newQuestion
        );


        renderQuestions();


        alert(
            `新增成功！\n題目ID：${newQuestion.id}`
        );


        return;
    }


    // ------------------------------
    // 修改模式
    // ------------------------------

    const q =
        questionBank.find(
            item =>
                item.id === editingId
        );


    if (!q) {

        alert("找不到這一題。");
        return;
    }


    q.book =
        bookNumber;


    q.unit =
        unitId;


    q.unitName =
        unit
            ? unit.name
            : unitId;


    q.concept =
        conceptId;


    q.conceptName =
        concept
            ? concept.name
            : conceptId;


    q.type =
        type;


    q.typeName =
        typeNames[type] ||
        type;


    q.difficulty =
        Number(
            document.getElementById(
                "editDifficulty"
            ).value
        );


    q.question =
        questionText;


    q.options =
        options;


    q.answer =
        Number(
            document.getElementById(
                "editAnswer"
            ).value
        );


    q.explanation =
        document.getElementById(
            "editExplanation"
        ).value.trim();


    q.requireWork =
        document.getElementById(
            "editRequireWork"
        ).value === "true";


    saveBank();

    renderQuestions();

    alert("修改成功！");
}


// ==========================================
// 停用 / 啟用
// ==========================================

function toggleQuestion() {

    const q =
        questionBank.find(
            item =>
                item.id === editingId
        );


    if (!q) return;


    q.active =
        q.active === false;


    saveBank();

    updateToggleButton(q);

    renderQuestions();
}


function updateToggleButton(q) {

    const button =
        document.getElementById(
            "toggleButton"
        );


    if (q.active === false) {

        button.textContent =
            "▶️ 重新啟用題目";

    } else {

        button.textContent =
            "⏸ 停用題目";
    }
}


// ==========================================
// 複製題目
// ==========================================

function duplicateQuestion() {

    const original =
        questionBank.find(
            q => q.id === editingId
        );


    if (!original) return;


    let number = 1;
    let newId = "";


    do {

        newId =
            `${original.id}-COPY-${number}`;

        number++;

    } while (
        questionBank.some(
            q => q.id === newId
        )
    );


    const copy = {

        ...original,

        id: newId,

        question:
            `${original.question}（複製）`,

        active: true
    };


    questionBank.push(copy);

    saveBank();

    renderQuestions();

    editQuestion(newId);
}


// ==========================================
// 關閉編輯器
// ==========================================

function closeEditor() {

    editingId = null;
    isCreating = false;

    document.getElementById(
        "editorArea"
    ).style.display = "none";

    document.getElementById(
        "toggleButton"
    ).style.display = "inline-block";
}

// ==========================================
// CSV 題庫批次匯入
// ==========================================

// 讀取 CSV 檔案
function readQuestionCSV(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            parseQuestionCSV(e.target.result);
        } catch (error) {
            console.error(error);
            alert("CSV 讀取失敗，請確認檔案格式。");
        }
    };

    reader.readAsText(file, "UTF-8");
}

// ==========================================
// 解析 CSV 單行
// 可處理雙引號與逗號
// ==========================================

function parseCSVLine(line) {
    const result = [];

    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            // CSV 中 "" 代表一個真正的雙引號
            if (insideQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === "," && !insideQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    result.push(current);

    return result;
}

// ==========================================
// 解析整份 CSV
// ==========================================

function parseQuestionCSV(text) {
    // 移除 Excel 有時候產生的 BOM
    text = text.replace(/^\uFEFF/, "");

    const lines = text
        .split(/\r?\n/)
        .filter((line) => {
            // 把逗號、雙引號與空白移除後
            // 如果什麼都沒有，就代表是 Excel 的空白列
            const content = line
                .replace(/,/g, "")
                .replace(/"/g, "")
                .trim();

            return content !== "";
        });

    if (lines.length < 2) {
        alert("CSV 裡沒有題目資料。");
        return;
    }

    // 第一列是欄位名稱
    const headers = parseCSVLine(lines[0]).map((header) =>
        header.trim(),
    );

    // CSV 必須包含的欄位
    const requiredHeaders = [
        "題目ID",
        "科目",
        "冊別",
        "大單元",
        "子觀念",
        "題型",
        "難度",
        "題目",
        "選項A",
        "選項B",
        "選項C",
        "選項D",
        "正確答案",
        "解析",
        "需要計算過程",
    ];

    // 檢查是否缺少欄位
    const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header),
    );

    if (missingHeaders.length > 0) {
        alert(`缺少欄位：${missingHeaders.join("、")}`);
        return;
    }

    const rows = [];

    // 從第二列開始讀取題目
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);

        const row = {};

        headers.forEach((header, index) => {
            row[header] = (values[index] || "").trim();
        });

        rows.push({
            rowNumber: i + 1,
            data: row,
        });
    }

    // 開始檢查題目資料
    validateImportRows(rows);
}

// ==========================================
// 檢查 CSV 題目資料
// ==========================================

function validateImportRows(rows) {
    // 每次重新匯入前先清空暫存
    pendingImportQuestions = [];

    const errors = [];

    rows.forEach(({ rowNumber, data }) => {
        // ------------------------------
        // 冊別
        // ------------------------------

        const bookText = String(data["冊別"] || "").trim();

        const bookNumber = Number(
            bookText.replace(/[^\d]/g, "")
        );
        const book = getBook(bookNumber);

        if (!book) {
            errors.push(
                `第 ${rowNumber} 列：找不到第 ${data["冊別"]} 冊`,
            );
            return;
        }

        // ------------------------------
        // 大單元
        // 可以填名稱或 ID
        // ------------------------------

        const unit = book.units.find(
            (item) =>
                item.name === data["大單元"] ||
                item.id === data["大單元"],
        );

        if (!unit) {
            errors.push(
                `第 ${rowNumber} 列：找不到大單元「${data["大單元"]}」`,
            );
            return;
        }

        // ------------------------------
        // 子觀念
        // 可以填名稱或 ID
        // ------------------------------

        const concept = unit.concepts.find(
            (item) =>
                item.name === data["子觀念"] ||
                item.id === data["子觀念"],
        );

        if (!concept) {
            errors.push(
                `第 ${rowNumber} 列：找不到子觀念「${data["子觀念"]}」`,
            );
            return;
        }

        // ------------------------------
        // 題目
        // ------------------------------

        if (!data["題目"]) {
            errors.push(
                `第 ${rowNumber} 列：題目不能空白`,
            );
            return;
        }

        // ------------------------------
        // 選項
        // ------------------------------

        const options = [
            data["選項A"],
            data["選項B"],
            data["選項C"],
            data["選項D"],
        ];

        if (options.some((option) => !option)) {
            errors.push(
                `第 ${rowNumber} 列：A～D 選項不可空白`,
            );
            return;
        }

        // ------------------------------
        // 正確答案
        // ------------------------------

        const answerMap = {
            A: 0,
            B: 1,
            C: 2,
            D: 3,
        };

        const answerText =
            data["正確答案"].toUpperCase();

        if (!(answerText in answerMap)) {
            errors.push(
                `第 ${rowNumber} 列：正確答案只能填 A、B、C、D`,
            );
            return;
        }

        // ------------------------------
        // 難度
        // ------------------------------

        const difficulty =
            Number(data["難度"]);

        if (
            !Number.isInteger(difficulty) ||
            difficulty < 1 ||
            difficulty > 5
        ) {
            errors.push(
                `第 ${rowNumber} 列：難度必須填 1～5`,
            );
            return;
        }

        // ------------------------------
        // 題型
        // ------------------------------

        const typeMap = {
            觀念: "concept",
            計算: "calculation",
            應用: "application",

            concept: "concept",
            calculation: "calculation",
            application: "application",
        };

        const type =
            typeMap[data["題型"]];

        if (!type) {
            errors.push(
                `第 ${rowNumber} 列：題型只能填觀念、計算或應用`,
            );
            return;
        }

        // ------------------------------
        // 題目 ID
        // 如果沒填，自動產生
        // ------------------------------

        let id =
            data["題目ID"];

        if (!id) {
            id = generateImportQuestionId(
                bookNumber,
                concept.id,
                pendingImportQuestions,
            );
        }

        // ------------------------------
        // 檢查 ID 是否重複
        // ------------------------------

        const duplicate =
            questionBank.some(
                (q) => q.id === id,
            ) ||
            pendingImportQuestions.some(
                (q) => q.id === id,
            );

        if (duplicate) {
            errors.push(
                `第 ${rowNumber} 列：題目 ID「${id}」重複`,
            );
            return;
        }

        // ------------------------------
        // 建立正式題目格式
        // ------------------------------

        pendingImportQuestions.push({
            id: id,

            subject: "science",
            subjectName: "理化",

            book: bookNumber,

            unit: unit.id,
            unitName: unit.name,

            concept: concept.id,
            conceptName: concept.name,

            type: type,

            typeName:
                type === "concept"
                    ? "觀念"
                    : type === "calculation"
                        ? "計算"
                        : "應用",

            difficulty: difficulty,

            question: data["題目"],

            options: options,

            answer: answerMap[answerText],

            explanation: data["解析"],

            requireWork: [
                "是",
                "true",
                "TRUE",
                "1",
            ].includes(
                data["需要計算過程"],
            ),

            active: true,
        });
    });

    // 顯示檢查結果
    showImportPreview(errors);
}

// ==========================================
// CSV 自動產生題目 ID
// ==========================================

function generateImportQuestionId(
    book,
    concept,
    pendingQuestions,
) {
    const prefix =
        `SCI-B${book}-${concept.toUpperCase()}`;

    const usedIds = new Set([
        ...questionBank.map((q) => q.id),
        ...pendingQuestions.map((q) => q.id),
    ]);

    let number = 1;
    let id = "";

    do {
        id =
            `${prefix}-${String(number).padStart(3, "0")}`;

        number++;
    } while (usedIds.has(id));

    return id;
}

// ==========================================
// 防止 HTML 特殊字元影響預覽
// ==========================================

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ==========================================
// 顯示 CSV 檢查結果
// ==========================================

function showImportPreview(errors) {
    const summary =
        document.getElementById(
            "importSummary",
        );

    const preview =
        document.getElementById(
            "importPreview",
        );

    const button =
        document.getElementById(
            "confirmImportButton",
        );

    // 顯示統計
    summary.innerHTML = `
    <strong>📋 檢查完成</strong><br>
    ✅ 可匯入：${pendingImportQuestions.length} 題<br>
    ❌ 有問題：${errors.length} 筆
  `;

    let html = "";

    // ------------------------------
    // 顯示錯誤
    // ------------------------------

    if (errors.length > 0) {
        html += `
      <div style="
        background: rgba(255, 80, 80, 0.12);
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 15px;
      ">
        <strong>⚠️ 發現問題</strong>
    `;

        errors.forEach((error) => {
            html += `
        <div>
          • ${escapeHtml(error)}
        </div>
      `;
        });

        html += "</div>";
    }

    // ------------------------------
    // 顯示可以匯入的題目
    // ------------------------------

    pendingImportQuestions.forEach((q) => {
        html += `
      <div class="question">

        <strong>
          ${escapeHtml(q.id)}
        </strong>

        <div style="margin-top: 5px;">
          第 ${q.book} 冊｜
          ${escapeHtml(q.unitName)}｜
          ${escapeHtml(q.conceptName)}｜
          ${escapeHtml(q.typeName)}｜
          難度 ${q.difficulty}
        </div>

        <div style="margin-top: 8px;">
          ${escapeHtml(q.question)}
        </div>

      </div>
    `;
    });

    preview.innerHTML = html;

    // 全部資料都正確才顯示確認匯入
    button.style.display =
        pendingImportQuestions.length > 0 &&
            errors.length === 0
            ? "inline-block"
            : "none";
}

// ==========================================
// 正式確認匯入
// ==========================================

function confirmQuestionImport() {
    if (
        pendingImportQuestions.length === 0
    ) {
        alert(
            "目前沒有可以匯入的題目。",
        );

        return;
    }

    const count =
        pendingImportQuestions.length;

    // 加入正式題庫
    questionBank.push(
        ...pendingImportQuestions,
    );

    // 儲存 localStorage
    saveBank();

    // 清空暫存
    pendingImportQuestions = [];

    // 更新畫面
    renderQuestions();
    renderSummary();

    // 清空預覽
    document.getElementById(
        "importPreview",
    ).innerHTML = "";

    // 顯示成功訊息
    document.getElementById(
        "importSummary",
    ).innerHTML =
        `✅ 已成功匯入 ${count} 題`;

    // 隱藏確認按鈕
    document.getElementById(
        "confirmImportButton",
    ).style.display = "none";

    // 清除選擇的 CSV
    document.getElementById(
        "csvFile",
    ).value = "";

    alert(
        `成功匯入 ${count} 題！`,
    );
}
// ==========================================
// 啟動
// ==========================================

initializeBank();

buildFilters();

renderQuestions();

renderSummary();