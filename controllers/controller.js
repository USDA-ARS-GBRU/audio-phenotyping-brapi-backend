const courses = [
    { id: 1, name: 'DAA' },
    { id: 2, name: 'DBMS' },
    { id: 3, name: 'SE' },
];

exports.getCourses = async (req, res) => {
    res.send(courses);
};

exports.getCourse = async (req, res) => {
    const course = courses.find((c) => c.id === parseInt(req.params.id));
    if (!course) res.status(404).send('ID not found');
    res.send(course);
};
