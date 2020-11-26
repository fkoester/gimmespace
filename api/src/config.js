import fs from 'fs'
import ini from 'ini'
import xdgBasedir from 'xdg-basedir'

const configFile = `${xdgBasedir.config}/gimmespace/config.ini`
const config = ini.parse(fs.readFileSync(configFile, 'utf-8'))

export default config
