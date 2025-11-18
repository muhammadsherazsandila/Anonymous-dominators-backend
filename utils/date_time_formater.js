import dayjs from "dayjs";

export const formate_date_time = (dateTime) => {
  return dayjs(dateTime).format("DD MMM YYYY, h:mm A");
};
