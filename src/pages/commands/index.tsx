import CommandTable from 'src/views/commands/CommandTable'

const CommandsPage = () => <CommandTable />

CommandsPage.acl = { action: 'read', subject: 'cms' }
CommandsPage.authGuard = true

export default CommandsPage
