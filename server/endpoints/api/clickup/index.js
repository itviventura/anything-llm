const { reqBody } = require("../../../utils/http");

function apiClickupEndpoints(app) {
  if (!app) return;

  app.post("/v1/clickup/list/:listId/task", async (request, response) => {
    /*
      #swagger.tags = ['Clickup']
      #swagger.description = 'Create a task in the selected list.'
      #swagger.responses[200] = {
        content: {
          "application/json": {
            schema: {
              type: 'object',
              example: {
                workspaces:
                  {
                    "id": "123",
                    "custom_id": null,
                    "name": "sample",
                    "text_content": "",
                    "description": "",
                    "date_created": "",
                    "due_date": null,
                    "status": { "status": "open", color: "", orderindex: 0, type: "" },
                    "assignees": [],
                  }
              }
            }
          }
        }
      }
      #swagger.responses[403] = {
        schema: {
          "$ref": "#/definitions/InvalidAPIKey"
        }
      }
      */
    try {
      const { listId } = request.params;
      const { name, description } = reqBody(request);

      const result = await fetch(
        `https://api.clickup.com/api/v2/list/${listId}/task`,
        {
          method: "POST",
          headers: {
            Authorization: process.env.CLICKUP_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            markdown_description: description,
            status: "open",
          }),
        }
      );

      if (!result.ok) {
        throw new Error(`Error: ${result.statusText}`);
      }

      const task = await result.json();
      response.status(200).json({ task });
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });
}

module.exports = { apiClickupEndpoints };
