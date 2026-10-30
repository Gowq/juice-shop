/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

export function serveLogFiles () {
  const logsDirectory = path.resolve('logs')
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const file = params.file
    const filePath = path.resolve(logsDirectory, file)

    if (!file.includes('/') && filePath.startsWith(logsDirectory + path.sep)) {
      res.sendFile(filePath)
    } else {
      res.status(403)
      next(new Error('File names must refer to files within the logs directory!'))
    }
  }
}
