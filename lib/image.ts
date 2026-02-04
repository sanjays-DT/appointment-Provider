export const bufferToImage = (avatar: any) => {
  if (!avatar?.data?.data || !avatar?.contentType) return null;

  const byteArray = new Uint8Array(avatar.data.data);
  const blob = new Blob([byteArray], { type: avatar.contentType });

  return URL.createObjectURL(blob);
};