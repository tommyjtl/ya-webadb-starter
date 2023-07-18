import React from "react";
import {
  NotificationInstance,
  NotificationPlacement,
} from "antd/es/notification/interface";
type NotificationType = "success" | "info" | "warning" | "error";

const openNotification = (
  api: NotificationInstance,
  type: NotificationType,
  placement: NotificationPlacement,
  title: string,
  description: string,
) => {
  api[type]({
    message: `${title}`,
    description: `${description}`,
    placement,
    duration: 2, // 2 seconds
  });
};

export default openNotification;
