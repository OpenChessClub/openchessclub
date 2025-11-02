exports.forbidden = (req, res) => {
  res.status(403).render('403', { 
    title: 'Access Denied',
    message: `You don't have permission to view this page.`,
    layout: 'error'
  });
};