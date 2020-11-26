import path from 'path'
import crypto from 'crypto'
import fs from 'fs'
import { DateTime } from 'luxon'
import nodemailer from 'nodemailer'
import Email from 'email-templates'
import Handlebars from 'handlebars'
import sharp from 'sharp'
import db from './db'
import {
  NotFoundError,
} from './errors'
import config from './config'

const mailTransporter = nodemailer.createTransport({
  host: config.EMAIL.host,
  port: config.EMAIL.port,
  secure: true,
  auth: {
    user: config.EMAIL.username,
    pass: config.EMAIL.password,
  },
})

const email = new Email({
  message: {
    from: `${config.SENDER.name} <${config.SENDER.email}>`,
  },
  send: false,
  preview: false,
  textOnly: true,
  transport: mailTransporter,
  views: {
    root: path.resolve('templates/emails'),
    options: {
      extension: 'hbs',
    },
  },
})

email.config.views.options.engineSource.requires.handlebars = Handlebars

function licensePlateDisplay(incident) {
  const {
    countryCode,
    vehicleRegistrationId,
  } = incident

  if (countryCode === 'DE') {
    return vehicleRegistrationId
  }

  return `[${countryCode}] ${vehicleRegistrationId}`
}

export async function generateIncidentReportEmail(incidentId) {
  const [incident] = await db.query('SELECT * FROM IncidentExtra WHERE incidentId = ?', [incidentId])

  if (!incident) {
    throw new NotFoundError()
  }

  const res = await email.send({
    template: 'report',
    message: {
      to: 'koesterreich@fastmail.fm',
    },
    locals: {
      incident: {
        ...incident,
        seenAtHuman: (
          DateTime.fromISO(incident.seenAt.toISOString())
            .toLocaleString(DateTime.DATETIME_FULL)
        ),
        licensePlate: licensePlateDisplay(incident),
      },
      authority: config.AUTHORITY,
      sender: config.SENDER,
    },
  })

  return res.originalMessage
}

export async function sendIncidentReportEmail(incidentId) {
  const {
    subject,
    text,
  } = await generateIncidentReportEmail(incidentId)

  const now = new Date()
  const reportsDir = config.MAIN.reports_dir
  const reportPath = path.join(
    reportsDir,
    now.getFullYear().toString(),
    (now.getMonth() + 1).toString().padStart(2, '0'),
    incidentId.toString().padStart(8, '0'),
  )

  await fs.promises.mkdir(reportPath, { recursive: true })

  await fs.promises.writeFile(path.join(reportPath, 'message.txt'), text)

  const photos = db.query('SELECT * FROM Photo WHERE incidentId = ? AND ignorePhoto = 0', [incidentId])

  const attachments = await Promise.map(photos, async (photo) => {
    const inFilePath = path.join(photo.dirpath, photo.filename)

    const inContent = await fs.promises.readFile(inFilePath)
    const sum = crypto.createHash('md5')
    sum.update(inContent)
    const hash = sum.digest('hex')
    const ext = path.extname(photo.filename)

    const hashFilename = `${hash}${ext}`

    const outFilePath = path.join(reportPath, hashFilename)

    const maxImageLength = parseInt(config.EMAIL.max_image_length, 10)

    const outContent = await sharp(inContent)
      .resize({ width: maxImageLength, height: maxImageLength, fit: 'inside' })
      .toBuffer()

    await fs.promises.writeFile(outFilePath, outContent)

    return {
      filename: `${hash}${ext}`,
      content: outContent,
    }
  })

  await mailTransporter.sendMail({
    from: `${config.SENDER.name} <${config.SENDER.email}>`,
    to: `${config.AUTHORITY.name} <${config.AUTHORITY.email}>`,
    bcc: `${config.SENDER.name} <${config.SENDER.email}>`,
    headers: {
      'User-Agent': 'gimmespace',
    },
    subject,
    text,
    attachments,
  })
}
