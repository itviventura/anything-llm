import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const Clickup = {
  createTask: async function (listId, data = {}) {
    const { task } = await fetch(`${API_BASE}/v1/clickup/list/${listId}/task`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .catch((e) => {
        return { task: null, message: e.message };
      });

    if (!task) {
      throw new Error("Failed to create task");
    }

    return { task };
  },
};

export default Clickup;
