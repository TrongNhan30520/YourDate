import { logDOM } from "@testing-library/react";
import React, { useState } from "react";

function App() {
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2000);
  const [lich, setLich] = useState("Dương");
  const [sex, setSex] = useState("Nam");

  const [changeDate, setChangeDate] = useState();
  const [nameOfYear, setNameOfYear] = useState();
  const [cungMenh, setCungMenh] = useState();
  const [mang, setMang] = useState();
  const [sunSign, setSunSign] = useState();

  function jdFromDate(dd, mm, yy) {
    var a, y, m, jd;
    a = Math.floor((14 - mm) / 12);
    y = yy + 4800 - a;
    m = mm + 12 * a - 3;
    jd =
      dd +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;
    if (jd < 2299161) {
      jd =
        dd +
        Math.floor((153 * m + 2) / 5) +
        365 * y +
        Math.floor(y / 4) -
        32083;
    }
    return jd;
  }

  function jdToDate(jd) {
    var a, b, c, d, e, m, day, month, year;
    if (jd > 2299160) {
      // After 5/10/1582, Gregorian calendar
      a = jd + 32044;
      b = Math.floor((4 * a + 3) / 146097);
      c = a - Math.floor((b * 146097) / 4);
    } else {
      b = 0;
      c = jd + 32082;
    }
    d = Math.floor((4 * c + 3) / 1461);
    e = c - Math.floor((1461 * d) / 4);
    m = Math.floor((5 * e + 2) / 153);
    day = e - Math.floor((153 * m + 2) / 5) + 1;
    month = m + 3 - 12 * Math.floor(m / 10);
    year = b * 100 + d - 4800 + Math.floor(m / 10);
    return new Array(day, month, year);
  }

  function getNewMoonDay(k, timeZone) {
    var T, T2, T3, dr, Jd1, M, Mpr, F, C1, deltat, JdNew;
    T = k / 1236.85; // Time in Julian centuries from 1900 January 0.5
    T2 = T * T;
    T3 = T2 * T;
    dr = Math.PI / 180;
    Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr); // Mean new moon
    M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3; // Sun's mean anomaly
    Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3; // Moon's mean anomaly
    F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3; // Moon's argument of latitude
    C1 =
      (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
      0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 =
      C1 -
      0.0074 * Math.sin(dr * (M - Mpr)) +
      0.0004 * Math.sin(dr * (2 * F + M));
    C1 =
      C1 -
      0.0004 * Math.sin(dr * (2 * F - M)) -
      0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 =
      C1 +
      0.001 * Math.sin(dr * (2 * F - Mpr)) +
      0.0005 * Math.sin(dr * (2 * Mpr + M));
    if (T < -11) {
      deltat =
        0.001 +
        0.000839 * T +
        0.0002261 * T2 -
        0.00000845 * T3 -
        0.000000081 * T * T3;
    } else {
      deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    }
    JdNew = Jd1 + C1 - deltat;
    return Math.floor(JdNew + 0.5 + timeZone / 24);
  }

  function getSunLongitude(jdn, timeZone) {
    var T, T2, dr, M, L0, DL, L;
    T = (jdn - 2451545.5 - timeZone / 24) / 36525; // Time in Julian centuries from 2000-01-01 12:00:00 GMT
    T2 = T * T;
    dr = Math.PI / 180; // degree to radian
    M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2; // mean anomaly, degree
    L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2; // mean longitude, degree
    DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL =
      DL +
      (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) +
      0.00029 * Math.sin(dr * 3 * M);
    L = L0 + DL; // true longitude, degree
    L = L * dr;
    L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2)); // Normalize to (0, 2*PI)
    return Math.floor((L / Math.PI) * 6);
  }

  function getLunarMonth11(yy, timeZone) {
    var k, off, nm, sunLong;
    off = jdFromDate(31, 12, yy) - 2415021;
    k = Math.floor(off / 29.530588853);
    nm = getNewMoonDay(k, timeZone);
    sunLong = getSunLongitude(nm, timeZone); // sun longitude at local midnight
    if (sunLong >= 9) {
      nm = getNewMoonDay(k - 1, timeZone);
    }
    return nm;
  }

  function getLeapMonthOffset(a11, timeZone) {
    var k, last, arc, i;
    k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    last = 0;
    i = 1; // We start with the month following lunar month 11
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    do {
      last = arc;
      i++;
      arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    } while (arc != last && i < 14);
    return i - 1;
  }

  function convertSolar2Lunar(dd, mm, yy, timeZone) {
    var k,
      dayNumber,
      monthStart,
      a11,
      b11,
      lunarDay,
      lunarMonth,
      lunarYear,
      lunarLeap;
    dayNumber = jdFromDate(dd, mm, yy);
    k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
    monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) {
      monthStart = getNewMoonDay(k, timeZone);
    }
    a11 = getLunarMonth11(yy, timeZone);
    b11 = a11;
    if (a11 >= monthStart) {
      lunarYear = yy;
      a11 = getLunarMonth11(yy - 1, timeZone);
    } else {
      lunarYear = yy + 1;
      b11 = getLunarMonth11(yy + 1, timeZone);
    }
    lunarDay = dayNumber - monthStart + 1;
    var diff = Math.floor((monthStart - a11) / 29);
    lunarLeap = 0;
    lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      var leapMonthDiff = getLeapMonthOffset(a11, timeZone);
      if (diff >= leapMonthDiff) {
        lunarMonth = diff + 10;
        if (diff == leapMonthDiff) {
          lunarLeap = 1;
        }
      }
    }
    if (lunarMonth > 12) {
      lunarMonth = lunarMonth - 12;
    }
    if (lunarMonth >= 11 && diff < 4) {
      lunarYear -= 1;
    }
    return new Array(lunarDay, lunarMonth, lunarYear);
  }

  function convertLunar2Solar(
    lunarDay,
    lunarMonth,
    lunarYear,
    lunarLeap,
    timeZone
  ) {
    var k, a11, b11, off, leapOff, leapMonth, monthStart;
    if (lunarMonth < 11) {
      a11 = getLunarMonth11(lunarYear - 1, timeZone);
      b11 = getLunarMonth11(lunarYear, timeZone);
    } else {
      a11 = getLunarMonth11(lunarYear, timeZone);
      b11 = getLunarMonth11(lunarYear + 1, timeZone);
    }
    off = lunarMonth - 11;
    if (off < 0) {
      off += 12;
    }
    if (b11 - a11 > 365) {
      leapOff = getLeapMonthOffset(a11, timeZone);
      leapMonth = leapOff - 2;
      if (leapMonth < 0) {
        leapMonth += 12;
      }
      if (lunarLeap != 0 && lunarMonth != leapMonth) {
        return new Array(0, 0, 0);
      } else if (lunarLeap != 0 || off >= leapOff) {
        off += 1;
      }
    }
    k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    monthStart = getNewMoonDay(k + off, timeZone);
    return jdToDate(monthStart + lunarDay - 1);
  }

  function convertSolarYear2LunarYear(yy) {
    var can = "",
      chi = "";
    switch (yy % 10) {
      case 0:
        can = "Canh";
        break;
      case 1:
        can = "Tân";
        break;
      case 2:
        can = "Nhâm";
        break;
      case 3:
        can = "Quý";
        break;
      case 4:
        can = "Giáp";
        break;
      case 5:
        can = "Ất";
        break;
      case 6:
        can = "Bính";
        break;
      case 7:
        can = "Đinh";
        break;
      case 8:
        can = "Mậu";
        break;
      case 9:
        can = "Kỷ";
        break;
      default:
    }
    switch (yy % 12) {
      case 0:
        chi = "Thân";
        break;
      case 1:
        chi = "Dậu";
        break;
      case 2:
        chi = "Tuất";
        break;
      case 3:
        chi = "Hợi";
        break;
      case 4:
        chi = "Tý";
        break;
      case 5:
        chi = "Sửu";
        break;
      case 6:
        chi = "Dần";
        break;
      case 7:
        chi = "Mẹo";
        break;
      case 8:
        chi = "Thìn";
        break;
      case 9:
        chi = "Tỵ";
        break;
      case 10:
        chi = "Ngọ";
        break;
      case 11:
        chi = "Mùi";
        break;
      default:
    }
    return `${can} ${chi}`;
  }

  function tinhCungMenh(yy, sex) {
    var sum = 0;
    do {
      sum = sum + (yy % 10);
      yy = Math.floor(yy / 10);
    } while (yy > 0);

    if (sex === "Nam") {
      switch (sum % 9) {
        case 0:
          return "Khôn";
        case 1:
          return "Khảm";
        case 2:
          return "Ly";
        case 3:
          return "Cấn";
        case 4:
          return "Đoài";
        case 5:
          return "Càn";
        case 6:
          return "Khôn";
        case 7:
          return "Tốn";
        case 8:
          return "Chấn";
        default:
      }
    } else if (sex === "Nữ") {
      switch (sum % 9) {
        case 0:
          return "Tốn";
        case 1:
          return "Cấn";
        case 2:
          return "Càn";
        case 3:
          return "Đoài";
        case 4:
          return "Cấn";
        case 5:
          return "Ly";
        case 6:
          return "Khảm";
        case 7:
          return "Khôn";
        case 8:
          return "Chấn";
        default:
      }
    }
  }

  function tinhHanhMenh(yy) {
    const namAmLich = convertSolarYear2LunarYear(yy).split(" ");
    var sum = 0;
    switch (namAmLich[0]) {
      case "Giáp":
        sum += 1;
        break;
      case "Ất":
        sum += 1;
        break;
      case "Bính":
        sum += 2;
        break;
      case "Đinh":
        sum += 2;
        break;
      case "Mậu":
        sum += 3;
        break;
      case "Kỷ":
        sum += 3;
        break;
      case "Canh":
        sum += 4;
        break;
      case "Tân":
        sum += 4;
        break;
      case "Nhâm":
        sum += 5;
        break;
      case "Quý":
        sum += 5;
        break;
      default:
    }
    switch (namAmLich[1]) {
      case "Tý":
        sum += 0;
        break;
      case "Sửu":
        sum += 0;
        break;
      case "Ngọ":
        sum += 0;
        break;
      case "Mùi":
        sum += 0;
        break;
      case "Dần":
        sum += 1;
        break;
      case "Mão":
        sum += 1;
        break;
      case "Thân":
        sum += 1;
        break;
      case "Dậu":
        sum += 1;
        break;
      case "Thìn":
        sum += 2;
        break;
      case "Tỵ":
        sum += 2;
        break;
      case "Tuất":
        sum += 2;
        break;
      case "Hợi":
        sum += 2;
        break;
      default:
    }
    switch (sum % 5) {
      case 0:
        return "Mộc";
      case 1:
        return "Kim";
      case 2:
        return "Thủy";
      case 3:
        return "Hỏa";
      case 4:
        return "Thổ";
      default:
        return "Viettel";
    }
  }

  function KiemTraCungHoangDao(ngay, thang, nam) {
    switch (thang) {
      case 1:
        if (ngay <= 19 && ngay > 0) {
          return "Ma Kết";
        } else if (ngay > 19 && ngay <= 31) {
          return "Bảo Bình";
        }
        break;

      case 2:
        if (ngay <= 18 && ngay > 0) {
          return "Bảo Bình";
        } else if (ngay > 18 && ngay <= 29) {
          return "Song Ngư";
        }
        break;

      case 3:
        if (ngay <= 20 && ngay > 0) {
          return "Song Ngư";
        } else if (ngay > 20 && ngay <= 31) {
          return "Bạch Dương";
        }
        break;

      case 4:
        if (ngay <= 19 && ngay > 0) {
          return "Bạch Dương";
        } else if (ngay > 19 && ngay <= 30) {
          return "Kim Ngưu";
        }
        break;

      case 5:
        if (ngay <= 20 && ngay > 0) {
          return "Kim Ngưu";
        } else if (ngay > 20 && ngay <= 31) {
          return "Song Tử";
        }
        break;

      case 6:
        if (ngay <= 21 && ngay > 0) {
          return "Song Tử";
        } else if (ngay > 21 && ngay <= 30) {
          return "Cự Giải";
        }
        break;

      case 7:
        if (ngay <= 22 && ngay > 0) {
          return "Cự Giải";
        } else if (ngay > 22 && ngay <= 31) {
          return "Sư Tử";
        }
        break;

      case 8:
        if (ngay <= 22 && ngay > 0) {
          return "Sư Tử";
        } else if (ngay > 22 && ngay <= 31) {
          return "Xử nữ";
        }
        break;

      case 9:
        if (ngay <= 22 && ngay > 0) {
          return "Xử nữ";
        } else if (ngay > 22 && ngay <= 30) {
          return "Thiên Bình";
        }
        break;

      case 10:
        if (ngay <= 23 && ngay > 0) {
          return "Thiên Bình";
        } else if (ngay > 23 && ngay <= 31) {
          return "Bọ Cạp";
        }
        break;

      case 11:
        if (ngay <= 21 && ngay > 0) {
          return "Bọ Cạp";
        } else if (ngay > 21 && ngay <= 30) {
          return "Nhân Mã";
        }
        break;

      case 12:
        if (ngay <= 21 && ngay > 0) {
          return "Nhân Mã";
        } else if (ngay > 21 && ngay <= 31) {
          return "Ma kết";
        }
        break;

      default:
        break;
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: "2rem",
          padding: "8px",
          display: "flex",
          flexDirection: "row",
        }}
      >
        Nhập ngày tháng năm sinh
        <div
          style={{
            fontSize: "1.3rem",
            padding: "8px",
          }}
        >
          <input
            type="radio"
            id="duong"
            name="lich"
            value="Dương"
            checked={lich === "Dương"}
            onChange={(e) => {
              setLich("Dương");
            }}
          />
          <label htmlFor="duong">Dương Lịch</label>

          <input
            type="radio"
            id="am"
            name="lich"
            value="Âm"
            onChange={(e) => {
              setLich("Âm");
            }}
            checked={lich === "Âm"}
          />
          <label htmlFor="am">Âm Lich</label>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          padding: "8px",
        }}
      >
        <select
          id="day"
          name="day"
          style={{ width: "80px", height: "30px" }}
          value={day}
          onChange={(e) => {
            setDay(e.target.value);
          }}
        >
          <option value="1">01</option>
          <option value="2">02</option>
          <option value="3">03</option>
          <option value="4">04</option>
          <option value="5">05</option>
          <option value="6">06</option>
          <option value="7">07</option>
          <option value="8">08</option>
          <option value="9">09</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
          <option value="13">13</option>
          <option value="14">14</option>
          <option value="15">15</option>
          <option value="16">16</option>
          <option value="17">17</option>
          <option value="18">18</option>
          <option value="19">19</option>
          <option value="20">20</option>
          <option value="21">21</option>
          <option value="22">22</option>
          <option value="23">23</option>
          <option value="24">24</option>
          <option value="25">25</option>
          <option value="26">26</option>
          <option value="27">27</option>
          <option value="28">28</option>
          <option value="29">29</option>
          <option value="30">30</option>
          <option value="31">31</option>
        </select>
        <select
          id="month"
          name="month"
          style={{ width: "80px", height: "30px" }}
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
          }}
        >
          <option value="1">01</option>
          <option value="2">02</option>
          <option value="3">03</option>
          <option value="4">04</option>
          <option value="5">05</option>
          <option value="6">06</option>
          <option value="7">07</option>
          <option value="8">08</option>
          <option value="9">09</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
        </select>
        <input
          onChange={(e) => {
            setYear(e.target.value);
          }}
          type="number"
          style={{ width: "80px" }}
        />
      </div>
      <div
        style={{
          fontSize: "1.3rem",
          padding: "8px",
        }}
      >
        Chọn giới tính của bạn
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "16px",
        }}
      >
        <input
          type="radio"
          id="nam"
          name="Sex"
          value="Nam"
          checked={sex === "Nam"}
          onChange={(e) => {
            setSex("Nam");
          }}
        />
        <label htmlFor="nam">Nam</label>

        <input
          type="radio"
          id="nu"
          name="Sex"
          value="Nữ"
          onChange={(e) => {
            setSex("Nữ");
          }}
          checked={sex === "Nữ"}
        />
        <label htmlFor="nu">Nữ</label>
      </div>
      <button
        style={{ padding: "8px", margin: "16px" }}
        onClick={(e) => {
          if (lich === "Dương") {
            const d = convertSolar2Lunar(
              Number(day),
              Number(month),
              Number(year),
              7
            );
            setChangeDate(d);
            setNameOfYear(convertSolarYear2LunarYear(d[2]));
            setCungMenh(tinhCungMenh(d[2], sex));
            setMang(tinhHanhMenh(d[2]));
            setSunSign(
              KiemTraCungHoangDao(Number(day), Number(month), Number(year))
            );
          } else {
            const a11 = getLunarMonth11(Number(year), 7);
            const lunarLeap = getLeapMonthOffset(a11, 7);
            const d = convertLunar2Solar(
              Number(day),
              Number(month),
              Number(year),
              lunarLeap,
              7
            );
            setChangeDate(d);
            setNameOfYear(convertSolarYear2LunarYear(Number(year)));
            setCungMenh(tinhCungMenh(Number(year), sex));
            setMang(tinhHanhMenh(Number(year)));
            setSunSign(KiemTraCungHoangDao(d[0], d[1], d[2]));
          }
        }}
      >
        Run
      </button>

      {changeDate ? (
        <div style={{ padding: "8px" }}>
          {lich === "Dương"
            ? "Ngày âm lịch tương ứng: "
            : "Ngày dương lịch tương ứng: "}{" "}
          {changeDate[0]}/{changeDate[1]}/{changeDate[2]}
        </div>
      ) : (
        ""
      )}

      {nameOfYear ? (
        <div style={{ padding: "8px" }}>
          Tên năm âm lịch tương ứng: {nameOfYear}
        </div>
      ) : (
        ""
      )}

      {sunSign ? (
        <div style={{ padding: "8px" }}>Cung mặt trời tương ứng: {sunSign}</div>
      ) : (
        ""
      )}

      {cungMenh ? (
        <div style={{ padding: "8px" }}>Cung mệnh tương ứng: {cungMenh}</div>
      ) : (
        ""
      )}

      {mang ? <div style={{ padding: "8px" }}>Mạng tương ứng: {mang}</div> : ""}
    </div>
  );
}

export default App;
