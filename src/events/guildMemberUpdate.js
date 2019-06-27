module.exports = async (oldMember, newMember) => {
  if (
    newMember.roles.has("515874214750715904") &&
    !newMember.roles.has("573143507343114243")
  )
    newMember.addRole("573143507343114243");
};
