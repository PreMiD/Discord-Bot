import * as Octokit from "@octokit/rest";

const octokit = new Octokit({
  auth: "9667ef049dab75e9abef1d1021ad853fe5a120b5"
});

(async () => {
  var projectString = `Project: ${
    (await octokit.projects.get({ project_id: 2058867 }))["data"].name
  }
  
  ${await Promise.all(
    (await octokit.projects.listColumns({ project_id: 2058867 }))["data"].map(
      async column => `${column.name}
  
  ${await Promise.all(
    (await octokit.projects.listCards({ column_id: column.id }))["data"].map(
      async card =>
        `${(await octokit.projects.getCard({ card_id: card.id }))["data"].url}`
    )
  )}`
    )
  )}`;

  console.log(projectString);
})();

/*
octokit.projects.listColumns({ project_id: 2058867 }).then(async ({ data }) => {
  await Promise.all(
    data.map(async column => [
      column,
      await octokit.projects.listCards({ column_id: column.id })["data"]
    ])
  ).then(thing => {
    console.log(`${thing.map(column => column[0].name)}`);
  });
});
*/
