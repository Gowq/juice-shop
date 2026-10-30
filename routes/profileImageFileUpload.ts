/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'
import fileType from 'file-type'

import logger from '../lib/logger'
import * as utils from '../lib/utils'
import { UserModel } from '../models/user'
import * as security from '../lib/insecurity'

export function profileImageFileUpload () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file
    const buffer = file?.buffer
    if (buffer === undefined) {
      res.status(500)
      next(new Error('Illegal file type'))
      return
    }
    const uploadedFileType = await fileType.fromBuffer(buffer)
    if (uploadedFileType === undefined) {
      res.status(500)
      next(new Error('Illegal file type'))
      return
    }
    if (uploadedFileType === null || !utils.startsWith(uploadedFileType.mime, 'image')) {
      res.status(415)
      next(new Error(`Profile image upload does not accept this file type${uploadedFileType ? (': ' + uploadedFileType.mime) : '.'}`))
      return
    }
    const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
    if (!loggedInUser) {
      next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
      return
    }

    if (!/^[a-z0-9]+$/i.test(uploadedFileType.ext)) {
      next(new Error('Illegal file type'))
      return
    }
    const filename = `${randomUUID()}.${uploadedFileType.ext}`
    const uploadsDir = path.resolve('frontend/dist/frontend/assets/public/images/uploads')
    const filePath = path.resolve(uploadsDir, filename)
    if (!filePath.startsWith(uploadsDir + path.sep)) {
      next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
      return
    }
    try {
      await fs.writeFile(filePath, buffer)
    } catch (err) {
      logger.warn('Error writing file: ' + (err instanceof Error ? err.message : String(err)))
    }

    try {
      const user = await UserModel.findByPk(loggedInUser.data.id)
      if (user != null) {
        await user.update({ profileImage: `assets/public/images/uploads/${filename}` })
      }
    } catch (error) {
      next(error)
    }
    res.location(process.env.BASE_PATH + '/profile')
    res.redirect(process.env.BASE_PATH + '/profile')
  }
}
