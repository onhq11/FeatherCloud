import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { INFO_URL_COPIED } from "../../../App";
import { formatBytes, formatDate } from "../../../Utils/formattingUtils";

export default function File({
  data,
  handleReloadList,
  handleChangePath,
  path,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isXlScreen = useMediaQuery(theme.breakpoints.up("xl"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));

  const generateUrl = (name) => {
    return "/f/" + name;
  };

  const handleOpen = () => {
    if (data.is_directory) {
      handleChangePath(data.name);
    } else {
      const url = path.replace(/~/g, "");
      window.open(
        generateUrl(url + (url.length > 0 ? "/" + data.name : data.name)),
      );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        border: "1px solid lightgray",
        p: 1,
        borderRadius: "9px",
        position: "relative",
        overflow: "hidden",
        minHeight: "60px",
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": {
          boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.1)",
        },
      }}
      onClick={handleOpen}
    >
      <Box sx={{ px: 2.5, py: 1.5 }}>
        {data.is_directory ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="M0 0h24v24H0z" />
              <path
                fill="#b1b1b1"
                d="M9 3a1 1 0 0 1 .608.206l.1.087L12.414 6H19a3 3 0 0 1 2.995 2.824L22 9v8a3 3 0 0 1-2.824 2.995L19 20H5a3 3 0 0 1-2.995-2.824L2 17V6a3 3 0 0 1 2.824-2.995L5 3h4z"
              />
            </g>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
          >
            <g fill="#b1b1b1">
              <path
                fillRule="evenodd"
                d="M14 22h-4c-3.771 0-5.657 0-6.828-1.172C2 19.657 2 17.771 2 14v-4c0-3.771 0-5.657 1.172-6.828C4.343 2 6.239 2 10.03 2c.606 0 1.091 0 1.5.017c-.013.08-.02.161-.02.244l-.01 2.834c0 1.097 0 2.067.105 2.848c.114.847.375 1.694 1.067 2.386c.69.69 1.538.952 2.385 1.066c.781.105 1.751.105 2.848.105h4.052c.043.534.043 1.19.043 2.063V14c0 3.771 0 5.657-1.172 6.828C19.657 22 17.771 22 14 22Z"
                clipRule="evenodd"
              />
              <path d="m19.352 7.617l-3.96-3.563c-1.127-1.015-1.69-1.523-2.383-1.788L13 5c0 2.357 0 3.536.732 4.268C14.464 10 15.643 10 18 10h3.58c-.362-.704-1.012-1.288-2.228-2.383Z" />
            </g>
          </svg>
        )}
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box>
          <Tooltip title={data.name}>
            <Typography
              sx={{ color: "#919191", cursor: "pointer" }}
              onClick={(event) => {
                event.stopPropagation();
                const url = path.replace(/~/g, "");

                window.navigator.clipboard
                  .writeText(
                    window.location.href.substring(
                      0,
                      window.location.href.length - 1,
                    ) +
                      generateUrl(
                        url + (url.length > 0 ? "/" + data.name : data.name),
                      ),
                  )
                  .then(() => {
                    enqueueSnackbar(INFO_URL_COPIED, {
                      variant: "success",
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      autoHideDuration: 1000,
                      style: {
                        backgroundColor: "#4cbd8b",
                        color: "white",
                      },
                    });
                  });
              }}
            >
              {data.name.length > (isXlScreen ? 30 : isSmallScreen ? 15 : 7)
                ? data.name.substring(
                    0,
                    isXlScreen ? 30 : isSmallScreen ? 15 : 7,
                  ) + "..."
                : data.name}
            </Typography>
          </Tooltip>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: "#c1c1c1", fontSize: 12, mt: 1 }}>
              {formatDate(data.last_modified)}
            </Typography>
            {!data.is_directory && (
              <Typography sx={{ color: "#c1c1c1", fontSize: 12, mt: 1 }}>
                {formatBytes(data.size)}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ minWidth: "120px", justifyContent: "end", display: "flex" }}>
          <Tooltip title="Remove">
            <IconButton
              onClick={(event) => {
                event.stopPropagation();

                fetch(
                  "/api/file/remove/" +
                    (path !== "~" ? path + "/" + data.name : data.name),
                  {
                    method: "DELETE",
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                      Authorization: localStorage.getItem("key"),
                    },
                  },
                )
                  .then((res) => {
                    if (res.status !== 200) {
                      return res.json().then((error) => {
                        handleReloadList();
                        throw new Error(error.message);
                      });
                    }

                    return res.json();
                  })
                  .then(() => {
                    handleReloadList();
                  })
                  .catch((err) => {
                    console.error(err);
                    enqueueSnackbar(err.message, {
                      variant: "error",
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      autoHideDuration: 2000,
                      style: {
                        backgroundColor: "#dc4d5e",
                        color: "white",
                      },
                    });
                    handleReloadList();
                  });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 256 256"
              >
                <path
                  fill="#dc4d5e"
                  d="M216 48h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16ZM96 40a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm96 168H64V64h128Zm-80-104v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Zm48 0v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Z"
                />
              </svg>
            </IconButton>
          </Tooltip>
          <Tooltip title="Open">
            <IconButton>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 256 256"
              >
                <path
                  fill="#b1b1b1"
                  d="m141.66 133.66l-40 40a8 8 0 0 1-11.32-11.32L116.69 136H24a8 8 0 0 1 0-16h92.69L90.34 93.66a8 8 0 0 1 11.32-11.32l40 40a8 8 0 0 1 0 11.32ZM192 32h-56a8 8 0 0 0 0 16h56v160h-56a8 8 0 0 0 0 16h56a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Z"
                />
              </svg>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
