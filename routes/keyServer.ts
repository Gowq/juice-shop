/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

export function serveKeyFiles () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const file = params.file
    const baseDirectory = path.resolve('encryptionkeys')
    const filePath = path.resolve(baseDirectory, file)

    if (!file.includes('/') && filePath.startsWith(baseDirectory + path.sep)) {
      res.sendFile(filePath)
    } else {
      res.status(403)
      next(new Error('File names must remain within the encryptionkeys directory and cannot contain forward slashes!'))
    }
  }
}
