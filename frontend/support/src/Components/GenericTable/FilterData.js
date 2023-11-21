import { isBoolean  } from "lodash";
import moment from "moment";

export const operators = {
  string: [
    {
      caption: "Equals",
      name: "=",
    },
    {
      caption: "Does not Equal",
      name: "<>",
    },
    {
      caption: "Contains",
      name: "contains",
    },
    {
      caption: "Does not Contain",
      name: "doesNotContain",
    }
  ],
  select: [
    {
      caption: "Is",
      name: "=",
    },
    {
      caption: "Is Not",
      name: "<>",
    }
  ],
  number: [
    {
      caption: "Equals",
      name: "=",
    },
    {
      caption: "Does not Equal",
      name: "<>",
    },
    {
      caption: "Greater than",
      name: ">",
    },
    {
      caption: "Less than",
      name: "<",
    }
  ],
  date: [
    {
      caption: "On",
      name: "dateEquals",
    },
    {
      caption: "Not On",
      name: "dateNotEqual",
    },
    {
      caption: "After",
      name: "dateGreater",
    },
    {
      caption: "Before",
      name: "dateLess",
    },
    {
      caption: "Since",
      name: "dateBetween",
    }
  ]
};

export const isEmpty = (value) => (!value || value == null || value.length === 0);
const more = (data, item) => {
  if (item.transformValue) {
    return data[item.field] > item.transformValue(item.value);
  }
  return data[item.field] > item.value;
};
const less = (data, item) => {
  if (item.transformValue) {
    return data[item.field] < item.transformValue(item.value);
  }
  return data[item.field] < item.value;
};

const contains = (data, item) => {
  if (!item.value) { return true; }
  if (data.hasOwnProperty(item.field) && data[item.field]) return data[item.field].toLowerCase().includes(item.value.toLowerCase());
  return false;
};
const doesNotContain = (data, item) => {
  if (!item.value) { return true; }
  if (data.hasOwnProperty(item.field) && data[item.field]) return !data[item.field].toLowerCase().includes(item.value.toLowerCase());
  return true;
};
const equals = (data, item) => {
  if (!item.value) { return true; }
  if (item.transformValue) {
    if (data.hasOwnProperty(item.field) && (data[item.field] || isBoolean(data[item.field]))) return data[item.field] === item.transformValue(item.value);
  }
  if (data.hasOwnProperty(item.field) && (data[item.field] || isBoolean(data[item.field]))) return data[item.field].toString().toLowerCase() === item.value.toString().toLowerCase();
  return false;
};
const isNotEqual = (data, item) => {
  if (!item.value) { return true; }
  if (item.transformValue) {
    if (data.hasOwnProperty(item.field) && (data[item.field] || isBoolean(data[item.field]))) return data[item.field] !== item.transformValue(item.value);
  }
  if (data.hasOwnProperty(item.field) && (data[item.field] || isBoolean(data[item.field]))) return data[item.field].toString().toLowerCase() !== item.value.toString().toLowerCase();
  return true;
};
const dateEquals = (data, item) => {
  if (!item.value) { return true; }
  if (data.hasOwnProperty(item.field) && data[item.field]) return moment(data[item.field]).isSame(item.value, "day");
  return false;
};
const dateNotEqual = (data, item) => {
  if (!item.value) { return true; }
  if (data.hasOwnProperty(item.field) && data[item.field]) return !moment(data[item.field]).isSame(item.value, "day");
  return false;
};
const dateGreater = (data, item) => {
  if (!item.value) { return true; }
  if (data.hasOwnProperty(item.field) && data[item.field]) return moment(data[item.field]).isAfter(item.value, "day");
  return false;
};
const dateLess = (data, item) => {
  if (!item.value) { return true; }
  if (data.hasOwnProperty(item.field) && data[item.field]) return moment(data[item.field]).isBefore(item.value, "day");
  return false;
};
const dateBetween = (data, item) => {
  if (!item.value) { return true; }
  if (data.hasOwnProperty(item.field) && data[item.field]) return moment(data[item.field]).isBetween(item.value, moment().add(1, "day").format("YYYY-MM-DD"), "day");
  return false;
};
export const filterItem = (data, filter) => {
  switch (filter.operator) {
    case "contains": return contains(data, filter);
    case "doesNotContain": return doesNotContain(data, filter);
    case "dateEquals": return dateEquals(data, filter);
    case "dateNotEqual": return dateNotEqual(data, filter);
    case "dateGreater": return dateGreater(data, filter);
    case "dateLess": return dateLess(data, filter);
    case "dateBetween": return dateBetween(data, filter);
    case "=": return equals(data, filter);
    case "<>": return isNotEqual(data, filter);
    case ">": return more(data, filter);
    case "<": return less(data, filter);
    default: throw Error("unknown operator");
  }
};

export const filterGroup = (data, groupName, items) =>
  (groupName.toLowerCase() === "or" ? filterGroupOr(data, items) : filterGroupAnd(data, items));

export const filterGroupOr = (data, items) => {
  const filteredData = items.reduce((initialData, item) => {
    if (item.items) {
      const grouped = filterGroup(data, item.groupName, item.items);
      return initialData.concat(grouped.filter((d) => initialData.indexOf(d) < 0));
    }
    return initialData.concat(data.filter((d) => initialData.indexOf(d) < 0 && filterItem(d, item)));
  }, []);
  return data.filter((d) => filteredData.includes(d));
};

export const filterGroupAnd = (data, items) => {
  return items.reduce((initialData, item) => {
    if (item.items) { return filterGroup(initialData, item.groupName, item.items); }
    return initialData.filter((d) => filterItem(d, item));
  }, data);
};

export const filterData = (data, filterValue) => {
  return filterGroup(data, filterValue.groupName, filterValue.items);
};
