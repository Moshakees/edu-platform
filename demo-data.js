// Demo Data Loader
// Run this in browser console to populate with sample data

(function () {
    console.log('🚀 Loading Demo Data...');

    // Generate a demo code
    const demoCode = window.store.generateCode('أحمد محمد', 30);
    console.log('✅ Demo Code Created:', demoCode.code);

    const db = window.store.db;

    // Add Teachers for existing subjects
    const mathTeacher = {
        id: Date.now(),
        subjectId: 1, // Math
        name: 'د. محمود السيد',
        image: 'https://i.pravatar.cc/150?img=12',
        bio: 'خبرة 15 سنة في تدريس الرياضيات'
    };

    const physicsTeacher = {
        id: Date.now() + 1,
        subjectId: 2, // Physics
        name: 'د. سارة أحمد',
        image: 'https://i.pravatar.cc/150?img=47',
        bio: 'دكتوراه في الفيزياء النظرية'
    };

    db.teachers.push(mathTeacher, physicsTeacher);

    // Add Units for Math Teacher
    const mathUnit1 = {
        id: Date.now() + 100,
        teacherId: mathTeacher.id,
        title: 'الوحدة الأولى: الجبر'
    };

    const mathUnit2 = {
        id: Date.now() + 101,
        teacherId: mathTeacher.id,
        title: 'الوحدة الثانية: الهندسة'
    };

    db.units.push(mathUnit1, mathUnit2);

    // Add Lessons for Math Unit 1
    db.lessons.push({
        id: Date.now() + 200,
        unitId: mathUnit1.id,
        title: 'الدرس الأول: المعادلات الخطية',
        type: 'video',
        content: 'https://odysee.com/$/embed/@BrightSideArabic:8/10-%D8%A3%D9%84%D8%BA%D8%A7%D8%B2-%D8%B1%D9%8A%D8%A7%D8%B6%D9%8A%D8%A9:3'
    });

    db.lessons.push({
        id: Date.now() + 201,
        unitId: mathUnit1.id,
        title: 'الدرس الثاني: المعادلات التربيعية',
        type: 'video',
        content: 'https://odysee.com/$/embed/@BrightSideArabic:8/10-%D8%A3%D9%84%D8%BA%D8%A7%D8%B2-%D8%B1%D9%8A%D8%A7%D8%B6%D9%8A%D8%A9:3'
    });

    db.lessons.push({
        id: Date.now() + 202,
        unitId: mathUnit1.id,
        title: 'ملف: ملخص الوحدة الأولى',
        type: 'file',
        content: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    });

    db.lessons.push({
        id: Date.now() + 203,
        unitId: mathUnit1.id,
        title: 'اختبار: الوحدة الأولى',
        type: 'quiz',
        content: [
            {
                question: 'ما هو حل المعادلة: 2x + 4 = 10؟',
                options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
                correct: 1
            },
            {
                question: 'ما هي قيمة x في المعادلة: x² = 16؟',
                options: ['x = 2', 'x = 4', 'x = 8', 'x = 16'],
                correct: 1
            },
            {
                question: 'ما هو ناتج: 5 + 3 × 2؟',
                options: ['10', '11', '13', '16'],
                correct: 1
            },
            {
                question: 'أي من التالي عدد أولي؟',
                options: ['4', '6', '7', '9'],
                correct: 2
            },
            {
                question: 'ما هو الجذر التربيعي لـ 81؟',
                options: ['7', '8', '9', '10'],
                correct: 2
            }
        ]
    });

    // Add Lessons for Math Unit 2
    db.lessons.push({
        id: Date.now() + 210,
        unitId: mathUnit2.id,
        title: 'الدرس الأول: المثلثات',
        type: 'video',
        content: 'https://odysee.com/$/embed/@BrightSideArabic:8/10-%D8%A3%D9%84%D8%BA%D8%A7%D8%B2-%D8%B1%D9%8A%D8%A7%D8%B6%D9%8A%D8%A9:3'
    });

    // Add Units for Physics Teacher
    const physicsUnit1 = {
        id: Date.now() + 300,
        teacherId: physicsTeacher.id,
        title: 'الوحدة الأولى: الحركة'
    };

    db.units.push(physicsUnit1);

    db.lessons.push({
        id: Date.now() + 400,
        unitId: physicsUnit1.id,
        title: 'الدرس الأول: السرعة والتسارع',
        type: 'video',
        content: 'https://odysee.com/$/embed/@BrightSideArabic:8/10-%D8%A3%D9%84%D8%BA%D8%A7%D8%B2-%D8%B1%D9%8A%D8%A7%D8%B6%D9%8A%D8%A9:3'
    });

    db.lessons.push({
        id: Date.now() + 401,
        unitId: physicsUnit1.id,
        title: 'اختبار: الحركة',
        type: 'quiz',
        content: [
            {
                question: 'ما هي وحدة قياس السرعة؟',
                options: ['متر', 'متر/ثانية', 'ثانية', 'كيلوجرام'],
                correct: 1
            },
            {
                question: 'ما هو التسارع؟',
                options: ['معدل تغير المسافة', 'معدل تغير السرعة', 'معدل تغير الزمن', 'معدل تغير الكتلة'],
                correct: 1
            },
            {
                question: 'إذا كانت السرعة ثابتة، فإن التسارع يساوي:',
                options: ['1', '0', '-1', 'غير محدد'],
                correct: 1
            }
        ]
    });

    window.store.save(db);

    console.log('✅ Demo Data Loaded Successfully!');
    console.log('📝 Use this code to login:', demoCode.code);
    console.log('🔑 Or use admin code: admin123');
    console.log('');
    console.log('📊 Summary:');
    console.log('- Subjects:', db.subjects.length);
    console.log('- Teachers:', db.teachers.length);
    console.log('- Units:', db.units.length);
    console.log('- Lessons:', db.lessons.length);
    console.log('- Codes:', db.codes.length);

    // Reload page to show new data
    setTimeout(() => {
        console.log('🔄 Reloading page...');
        location.reload();
    }, 2000);
})();
