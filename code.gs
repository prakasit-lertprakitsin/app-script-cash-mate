// CashMate - ระบบบันทึกรายรับรายจ่ายสำหรับร้านค้า
// Google Apps Script Code.gs

const SHEET_ID = "1ob2l4m854g04Wdv34JzGLsklYL7XmhkJWiwF6jykv5o";
const SHEET_NAME = "main";

// ประเภทข้อมูล
const TYPE_ENUM = {
  USER: "user",
  LIST: "list",
  CATEGORIES: "categories",
};

// ประเภทรายการ
const TRANSACTION_TYPE = {
  INCOME: "income",
  EXPENSE: "expense",
  COST: "cost",
};

/**
 * ฟังก์ชันหลักสำหรับเข้าถึง Web App
 */
function doGet() {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("CashMate - ระบบบันทึกรายรับรายจ่าย")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * ฟังก์ชันสำหรับ include ไฟล์ HTML
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * ดึงข้อมูลทั้งหมดจาก Google Sheets
 */
function getSheetData() {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    Logger.log(data);
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * ดึงข้อมูลตาม type
 */
function getDataByType(type) {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return { success: true, data: [] };
    }

    var filteredData = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === type) {
        var parsedData = JSON.parse(data[i][2]);
        parsedData.rowIndex = i + 1; // เก็บ index ของแถวสำหรับ update/delete
        filteredData.push(parsedData);
      }
    }

    return {
      success: true,
      data: filteredData,
    };
  } catch (error) {
    Logger.log("Error in getDataByType: " + error.toString());
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * เพิ่มข้อมูลใหม่
 */
function addData(type, data) {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    var nextId = generateId();

    // เพิ่ม id และ timestamp
    data.id = nextId;
    data.created_at = new Date().toISOString();
    data.updated_at = new Date().toISOString();

    sheet.appendRow([nextId, type, JSON.stringify(data)]);

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    Logger.log("Error in addData: " + error.toString());
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * อัปเดตข้อมูล
 */
function updateData(rowIndex, type, data) {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    data.updated_at = new Date().toISOString();

    sheet.getRange(rowIndex, 3).setValue(JSON.stringify(data));

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    Logger.log("Error in updateData: " + error.toString());
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * ลบข้อมูล
 */
function deleteData(rowIndex) {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    sheet.deleteRow(rowIndex);

    return {
      success: true,
    };
  } catch (error) {
    Logger.log("Error in deleteData: " + error.toString());
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * สร้าง ID ใหม่ (timestamp + random)
 */
function generateId() {
  return (
    "CM" + Date.now().toString() + Math.floor(Math.random() * 1000).toString()
  );
}

/**
 * เข้ารหัสรหัสผ่าน (Simple Base64 encoding)
 */
function encodePassword(password) {
  return Utilities.base64Encode(password + "cashmate_salt");
}

/**
 * ตรวจสอบรหัสผ่าน
 */
function verifyPassword(password, encodedPassword) {
  return encodePassword(password) === encodedPassword;
}

/**
 * สร้างผู้ใช้ใหม่
 */
function createUser(name = "admin", password = "1234", role = "user") {
  try {
    // ตรวจสอบว่ามีผู้ใช้นี้อยู่แล้วหรือไม่
    var existingUsers = getDataByType(TYPE_ENUM.USER);
    if (existingUsers.success) {
      for (var i = 0; i < existingUsers.data.length; i++) {
        if (existingUsers.data[i].name === name) {
          return {
            success: false,
            error: "ชื่อผู้ใช้นี้มีอยู่แล้ว",
          };
        }
      }
    }

    var userData = {
      name: name,
      password: encodePassword(password),
      role: role,
    };

    return addData(TYPE_ENUM.USER, userData);
  } catch (error) {
    Logger.log("Error in createUser: " + error.toString());
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * ตรวจสอบการเข้าสู่ระบบ
 */
function loginUser(username, password) {
  try {
    var users = getDataByType(TYPE_ENUM.USER);
    if (!users.success) {
      return users;
    }

    for (var i = 0; i < users.data.length; i++) {
      var user = users.data[i];
      if (user.name === username && verifyPassword(password, user.password)) {
        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        };
      }
    }

    return {
      success: false,
      error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
    };
  } catch (error) {
    Logger.log("Error in loginUser: " + error.toString());
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * ดึงหมวดหมู่ตามประเภท
 */
function getCategoriesByType(typeId) {
  try {
    var categories = getDataByType(TYPE_ENUM.CATEGORIES);
    if (!categories.success) {
      return categories;
    }

    var filteredCategories = categories.data.filter(function (cat) {
      return cat.type_id === typeId;
    });

    return {
      success: true,
      data: filteredCategories,
    };
  } catch (error) {
    Logger.log("Error in getCategoriesByType: " + error.toString());
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * เพิ่มหมวดหมู่ใหม่
 */
function addCategory(typeId, name, description = "", note = "") {
  try {
    var categoryData = {
      type_id: typeId,
      name: name,
      description: description,
      note: note,
    };

    return addData(TYPE_ENUM.CATEGORIES, categoryData);
  } catch (error) {
    Logger.log("Error in addCategory: " + error.toString());
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * เพิ่มรายการใหม่
 */
function addTransaction(
  typeId,
  categoryId,
  amount,
  description = "",
  note = ""
) {
  try {
    var transactionData = {
      type_id: typeId,
      category_id: categoryId,
      amount: parseFloat(amount).toString(),
      description: description,
      note: note,
    };

    return addData(TYPE_ENUM.LIST, transactionData);
  } catch (error) {
    Logger.log("Error in addTransaction: " + error.toString());
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * ดึงรายการทั้งหมด พร้อม join กับหมวดหมู่
 */
function toThaiDateString(dateStr) {
  // คืนค่า yyyy-mm-dd (เวลาไทย)
  var d = new Date(dateStr);
  d.setHours(d.getHours() + 7); // ปรับเป็นเวลาไทย
  return d.toISOString().slice(0, 10);
}

function getTransactionsWithCategories(filters = {}) {
  try {
    var transactions = getDataByType(TYPE_ENUM.LIST);
    var categories = getDataByType(TYPE_ENUM.CATEGORIES);

    if (!transactions.success || !categories.success) {
      return {
        success: false,
        error: "ไม่สามารถดึงข้อมูลได้",
      };
    }

    // สร้าง map ของหมวดหมู่เพื่อความเร็ว
    var categoryMap = {};
    categories.data.forEach(function (cat) {
      categoryMap[cat.id] = cat;
    });

    // รวมข้อมูลรายการกับหมวดหมู่
    var result = transactions.data.map(function (transaction) {
      var category = categoryMap[transaction.category_id] || {};
      return {
        id: transaction.id,
        type_id: transaction.type_id,
        category_id: transaction.category_id,
        category_name: category.name || "ไม่พบหมวดหมู่",
        amount: parseFloat(transaction.amount),
        description: transaction.description,
        note: transaction.note,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
        rowIndex: transaction.rowIndex,
      };
    });

    // กรองข้อมูลตาม filters
    if (filters.type_id) {
      result = result.filter(function (item) {
        return item.type_id === filters.type_id;
      });
    }

    if (filters.category_id) {
      result = result.filter(function (item) {
        return item.category_id === filters.category_id;
      });
    }

    if (filters.date_from) {
      result = result.filter(function (item) {
        return toThaiDateString(item.created_at) >= filters.date_from;
      });
    }

    if (filters.date_to) {
      result = result.filter(function (item) {
        return toThaiDateString(item.created_at) <= filters.date_to;
      });
    }

    // เรียงลำดับตามวันที่ล่าสุด
    result.sort(function (a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    Logger.log("Error in getTransactionsWithCategories: " + error.toString());
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * สร้างรายงานสรุป
 */
function generateReport(filters = {}) {
  try {
    var transactions = getTransactionsWithCategories(filters);
    if (!transactions.success) {
      return transactions;
    }

    var data = transactions.data;
    var summary = {
      total_income: 0,
      total_expense: 0,
      total_cost: 0,
      profit: 0,
      income_by_category: {},
      expense_by_category: {},
      cost_by_category: {},
      transactions_count: {
        income: 0,
        expense: 0,
        cost: 0,
      },
    };

    data.forEach(function (transaction) {
      var amount = transaction.amount;
      var categoryName = transaction.category_name;

      switch (transaction.type_id) {
        case TRANSACTION_TYPE.INCOME:
          summary.total_income += amount;
          summary.transactions_count.income++;
          if (!summary.income_by_category[categoryName]) {
            summary.income_by_category[categoryName] = 0;
          }
          summary.income_by_category[categoryName] += amount;
          break;

        case TRANSACTION_TYPE.EXPENSE:
          summary.total_expense += amount;
          summary.transactions_count.expense++;
          if (!summary.expense_by_category[categoryName]) {
            summary.expense_by_category[categoryName] = 0;
          }
          summary.expense_by_category[categoryName] += amount;
          break;

        case TRANSACTION_TYPE.COST:
          summary.total_cost += amount;
          summary.transactions_count.cost++;
          if (!summary.cost_by_category[categoryName]) {
            summary.cost_by_category[categoryName] = 0;
          }
          summary.cost_by_category[categoryName] += amount;
          break;
      }
    });

    // คำนวณกำไร
    summary.profit =
      summary.total_income - summary.total_expense - summary.total_cost;

    return {
      success: true,
      data: summary,
      transactions: data,
    };
  } catch (error) {
    Logger.log("Error in generateReport: " + error.toString());
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * ตรวจสอบว่าหมวดหมู่ถูกใช้งานอยู่หรือไม่
 */
function isCategoryInUse(categoryId) {
  try {
    var transactions = getDataByType(TYPE_ENUM.LIST);
    if (!transactions.success) {
      return { success: false, error: transactions.error };
    }

    var inUse = transactions.data.some(function (transaction) {
      return transaction.category_id === categoryId;
    });

    return {
      success: true,
      inUse: inUse,
    };
  } catch (error) {
    Logger.log("Error in isCategoryInUse: " + error.toString());
    return {
      success: false,
      error: error.toString(),
    };
  }
}
