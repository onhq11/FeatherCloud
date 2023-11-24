import { Box, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Files from "./Files";
import useWebSocket from "react-use-websocket";
import {
  ERROR_INTERNAL_SERVER,
  INFO_KEY_SAVED,
  STATUS_INSPECT,
  STATUS_INSPECT_ABORT,
  STATUS_OK,
  STATUS_UPDATE_FILE,
} from "./App";
import { useSnackbar } from "notistack";
import FolderDialog from "./FolderDialog";

export default function FilesList({
  handleOpenPreview,
  handleChangeGlobalPath,
  uploadInProgress,
}) {
  const [files, setFiles] = useState([]);
  const [reloadList, setReloadList] = useState(false);
  const [path, setPath] = useState("index");
  const { enqueueSnackbar } = useSnackbar();
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [currentInProgress, setCurrentInProgress] = useState(false);

  useEffect(() => {
    if (!uploadInProgress) {
      setTimeout(() => {
        setCurrentInProgress(uploadInProgress);
      }, 100);
    }
    setCurrentInProgress(uploadInProgress);
  }, [uploadInProgress]);

  const handleOpenFolderDialog = () => {
    setOpenFolderDialog(true);
  };

  const { sendJsonMessage } = useWebSocket(
    window.location.href
      .replace(/^https/, "wss")
      .replace(/^http/, "ws")
      .replace(/\/$/, "") + "/update",
    {
      share: true,
      filter: () => false,
      onMessage: (event) => {
        const data = JSON.parse(event.data);
        switch (data.status) {
          case STATUS_UPDATE_FILE:
            if (!currentInProgress) {
              enqueueSnackbar(data.message, {
                variant: "success",
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                autoHideDuration: 2000,
                style: {
                  backgroundColor: "#4cbd8b",
                  color: "white",
                },
              });
            }

            setReloadList(!reloadList);
            break;
        }
      },
    },
  );

  useEffect(() => {
    sendJsonMessage({
      userId: localStorage.getItem("userId"),
    });
  }, [sendJsonMessage]);

  useEffect(() => {
    handleChangeGlobalPath(path);

    fetch("/api/files/" + path, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        const data = [...res];
        data.sort(
          (a, b) => new Date(b.last_modified) - new Date(a.last_modified),
        );

        setFiles(data);
      });
  }, [reloadList, path]);

  const handleChangePath = (path, overwrite) => {
    setPath((item) =>
      overwrite ? path : item !== "index" ? item + "/" + path : path,
    );
  };

  return (
    <Box
      sx={{
        flex: 1,
        gap: 2,
        display: "flex",
        flexDirection: "column",
        maxHeight: { xs: "", lg: "60vh" },
      }}
    >
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#a8a8a8" }}>
            Files list
          </Typography>
          <Box sx={{ display: "flex" }}>
            {path !== "index" && (
              <IconButton
                onClick={() => {
                  handleChangePath(
                    path.split("/").slice(0, -1).join("/") || "index",
                    true,
                  );
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 256 256"
                >
                  <path
                    fill="#b1b1b1"
                    d="M228 128a12 12 0 0 1-12 12H69l51.52 51.51a12 12 0 0 1-17 17l-72-72a12 12 0 0 1 0-17l72-72a12 12 0 0 1 17 17L69 116h147a12 12 0 0 1 12 12Z"
                  />
                </svg>
              </IconButton>
            )}
            <IconButton onClick={handleOpenFolderDialog}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4cbd8b"
                  d="M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2ZM11 12H8v2h3v3h2v-3h3v-2h-3V9h-2v3Z"
                />
              </svg>
            </IconButton>
          </Box>
        </Box>
        <span style={{ color: "#b1b1b1" }}>
          {(path.length > 29 ? "..." : "") +
            path.substring(
              path.length - 29 < 0
                ? 0
                : path.length -
                    29 +
                    path.substring(path.length - 29, path.length).indexOf("/"),
              path.length,
            )}
        </span>
      </Box>
      <FolderDialog
        isOpen={openFolderDialog}
        handleClose={() => setOpenFolderDialog(false)}
        path={path}
      />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100px",
          overflowY: "auto",
        }}
      >
        {files.map((item, index) => (
          <Files
            key={index}
            data={item}
            handleOpenPreview={handleOpenPreview}
            handleReloadList={() => setReloadList(!reloadList)}
            handleChangePath={handleChangePath}
            path={path}
          />
        ))}
      </Box>
    </Box>
  );
}
