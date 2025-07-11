#!/bin/bash

# Arranca backend y frontend en paralelo desde la raíz del proyecto

(cd backend && npm run start) &
BACK_PID=$!
(cd frontend && npm start) &
FRONT_PID=$!

wait $BACK_PID
wait $FRONT_PID 