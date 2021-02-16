/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { writable, derived } from "svelte/store";

const NOTIFICATION_TIMEOUT = 2000;

const createNotificationStore = () => {
  const _notification = writable({ id: undefined});
  let timeout;

  function send({ message, type = "default", code }) {
		_notification.set({ id: id(), type, message, code });
  }

  function clear() {
    _notification.set({ id: undefined });
  }

  const notifications = derived(_notification, ($_notification, set) => {
		// if there already was a notification, let's clear the timer
		// and reset it here.
		clearTimeout(timeout);
    set($_notification);
		// if this is not the reset message, set the timer.
    if ($_notification.id) {
      timeout = setTimeout(clear, NOTIFICATION_TIMEOUT);
    }
  })
  const { subscribe } = notifications;

  return {
    subscribe,
    send,
    clear: () => {
      clearTimeout(timeout);
      clear();
    },
    danger: msg => send(msg, "danger"),
    warning: msg => send(msg, "warning"),
    info: msg => send(msg, "info"),
    success: msg => send(msg, "success"),
  }
}

function id() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

export const notification = createNotificationStore();
